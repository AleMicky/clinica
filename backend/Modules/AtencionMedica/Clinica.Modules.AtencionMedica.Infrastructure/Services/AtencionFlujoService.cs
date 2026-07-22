using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.AtencionFlujo;
using Clinica.Modules.AtencionMedica.Domain.Constants;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class AtencionFlujoService(
    AtencionMedicaDbContext context,
    IWorkflowService workflowService) : IAtencionFlujoService
{
    public async Task<AtencionFlujoCompletitudResponse> GetCompletitudAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default)
    {
        var atencion = await LoadAtencionAsync(atencionId, cancellationToken);
        var estadoWorkflow = atencion.WorkflowInstanceId.HasValue
            ? await workflowService.ObtenerEstadoActualAsync(atencion.WorkflowInstanceId.Value, cancellationToken)
            : null;

        var estadoReferencia = estadoWorkflow ?? atencion.Estado;
        var (etapaActual, actionCode) = ResolveEtapaYSalida(estadoReferencia);

        var secciones = await BuildSeccionesCompletitudAsync(atencion, cancellationToken);
        var seccionesEtapa = secciones.Where(x => x.EtapaFlujo == etapaActual).ToList();
        var etapaCompleta = IsEtapaCompleta(seccionesEtapa, etapaActual);

        return new AtencionFlujoCompletitudResponse(
            atencion.Id,
            atencion.Estado,
            atencion.WorkflowInstanceId,
            estadoWorkflow,
            etapaActual,
            etapaCompleta && actionCode is not null && atencion.WorkflowInstanceId.HasValue,
            actionCode,
            actionCode is null ? null : ObtenerNombreAccion(actionCode),
            secciones);
    }

    public async Task<AvanzarAtencionFlujoResponse> AvanzarFlujoAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default)
    {
        var atencion = await context.Atenciones
            .FirstOrDefaultAsync(x => x.Id == atencionId, cancellationToken)
            ?? throw new NotFoundException("La atención no existe.");

        if (!atencion.WorkflowInstanceId.HasValue)
            throw new BusinessException("La atención no tiene un workflow asociado.");

        var estadoAnterior = atencion.Estado;
        var estadoWorkflow = await workflowService.ObtenerEstadoActualAsync(
            atencion.WorkflowInstanceId.Value,
            cancellationToken)
            ?? estadoAnterior;

        var (etapaRequerida, actionCode) = ResolveEtapaYSalida(estadoWorkflow);

        if (actionCode is null)
            throw new BusinessException("No hay una transición disponible desde el estado actual.");

        var secciones = await BuildSeccionesCompletitudAsync(atencion, cancellationToken);
        var seccionesEtapa = secciones.Where(x => x.EtapaFlujo == etapaRequerida).ToList();

        if (!IsEtapaCompleta(seccionesEtapa, etapaRequerida))
        {
            var pendientes = seccionesEtapa
                .Where(x => !x.Completa)
                .Select(x => x.Nombre)
                .ToList();

            throw new BusinessException(
                pendientes.Count > 0
                    ? $"Complete las secciones pendientes: {string.Join(", ", pendientes)}."
                    : "Complete los campos requeridos de la etapa actual antes de avanzar.");
        }

        var nuevoEstado = await workflowService.EjecutarTransicionAsync(
            atencion.WorkflowInstanceId.Value,
            actionCode,
            cancellationToken)
            ?? throw new BusinessException("No se pudo ejecutar la transición del workflow.");

        atencion.Estado = nuevoEstado;
        await context.SaveChangesAsync(cancellationToken);

        return new AvanzarAtencionFlujoResponse(
            atencion.Id,
            estadoAnterior,
            nuevoEstado,
            actionCode);
    }

    private async Task<AtencionEntity> LoadAtencionAsync(Guid atencionId, CancellationToken cancellationToken)
    {
        return await context.Atenciones
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == atencionId, cancellationToken)
            ?? throw new NotFoundException("La atención no existe.");
    }
    private async Task<IReadOnlyCollection<SeccionCompletitudResponse>> BuildSeccionesCompletitudAsync(
        AtencionEntity atencion,
        CancellationToken cancellationToken)
    {
        if (!atencion.FormularioClinicoId.HasValue)
            return [];

        var formulario = await context.FormulariosClinicos
            .AsNoTracking()
            .Include(x => x.Secciones)
            .ThenInclude(x => x.Campos)
            .ThenInclude(x => x.TipoCampoFormulario)
            .FirstOrDefaultAsync(x => x.Id == atencion.FormularioClinicoId.Value, cancellationToken);

        if (formulario is null)
            return [];

        var respuestas = await context.AtencionFormularioRespuestas
            .AsNoTracking()
            .Where(x => x.AtencionId == atencion.Id)
            .ToListAsync(cancellationToken);

        var respuestasMap = respuestas.ToDictionary(x => x.FormularioCampoId);

        return formulario.Secciones
            .Where(x => x.Visible)
            .OrderBy(x => x.Orden)
            .Select(seccion =>
            {
                var camposVisibles = seccion.Campos
                    .Where(c => c.Visible)
                    .ToList();

                var requeridos = camposVisibles.Where(c => c.EsRequerido).ToList();
                var completados = requeridos.Count(c =>
                    respuestasMap.TryGetValue(c.Id, out var respuesta) &&
                    TieneValor(respuesta, c.TipoCampoFormulario.TipoDato));

                return new SeccionCompletitudResponse(
                    seccion.Id,
                    seccion.Codigo,
                    seccion.Nombre,
                    seccion.EtapaFlujo,
                    seccion.Orden,
                    requeridos.Count,
                    completados,
                    requeridos.Count == 0 || completados == requeridos.Count);
            })
            .ToList();
    }

    private static bool IsEtapaCompleta(
        IReadOnlyCollection<SeccionCompletitudResponse> secciones,
        string? etapa)
    {
        if (string.IsNullOrWhiteSpace(etapa))
            return false;

        var seccionesEtapa = secciones.Where(x => x.EtapaFlujo == etapa).ToList();

        if (seccionesEtapa.Count == 0)
            return etapa == AtencionEtapasFlujo.Triaje;

        return seccionesEtapa.All(x => x.Completa);
    }

    private static (string? Etapa, string? ActionCode) ResolveEtapaYSalida(string estado)
    {
        if (!AtencionFlujoTransiciones.SalidaPorEstado.TryGetValue(estado, out var config))
            return (null, null);

        return (config.EtapaRequerida, config.ActionCode);
    }

    private static string ObtenerNombreAccion(string actionCode) => actionCode switch
    {
        "ENVIAR_TRIAJE" => "Enviar a triaje",
        "ENVIAR_ENFERMERIA" => "Enviar a enfermería",
        "ENVIAR_MEDICO" => "Enviar a consulta médica",
        "ENVIAR_CAJA" => "Enviar a caja",
        _ => actionCode
    };

    private static bool TieneValor(AtencionFormularioRespuesta respuesta, string tipoDato)
    {
        return tipoDato switch
        {
            "int" or "decimal" => respuesta.ValorNumero.HasValue,
            "date" or "datetime" or "time" => respuesta.ValorFecha.HasValue,
            "bool" => respuesta.ValorBooleano.HasValue,
            "json" => !string.IsNullOrWhiteSpace(respuesta.ValorJson),
            _ => !string.IsNullOrWhiteSpace(respuesta.ValorTexto)
        };
    }
}
