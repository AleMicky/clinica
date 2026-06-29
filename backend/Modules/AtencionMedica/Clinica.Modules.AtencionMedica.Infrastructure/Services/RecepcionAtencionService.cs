using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Application.Recepcion;
using Clinica.Modules.AtencionMedica.Domain.Constants;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class RecepcionAtencionService(
    AtencionMedicaDbContext context,
    IWorkflowService workflowService) : IRecepcionAtencionService
{
    private const string RecepcionSeccionCodigo = "RECEPCION";

    public async Task<FormularioRecepcionResponse> GetFormularioRecepcionAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken = default)
    {
        await EnsureTipoAtencionExistsAsync(tipoAtencionId, cancellationToken);

        var formulario = await GetFormularioActivoAsync(tipoAtencionId, cancellationToken)
            ?? throw new BusinessException(
                "No existe un formulario clínico activo para el tipo de atención.");

        var secciones = formulario.Secciones
            .Where(x => x.Codigo == RecepcionSeccionCodigo)
            .OrderBy(x => x.Orden)
            .Select(seccion => new FormularioRecepcionSeccionResponse(
                seccion.Id,
                seccion.Codigo,
                seccion.Nombre,
                seccion.Orden,
                seccion.Campos
                    .Where(c => c.Visible)
                    .OrderBy(c => c.Orden)
                    .Select(campo => new FormularioRecepcionCampoResponse(
                        campo.Id,
                        campo.Codigo,
                        campo.Etiqueta,
                        campo.TipoCampoFormulario.Codigo,
                        campo.TipoCampoFormulario.ControlFrontend,
                        campo.TipoCampoFormulario.TipoDato,
                        campo.EsRequerido,
                        campo.Visible,
                        campo.Orden,
                        campo.Placeholder,
                        campo.ValorDefecto,
                        campo.OpcionesJson))
                    .ToList()))
            .ToList();

        return new FormularioRecepcionResponse(
            formulario.Id,
            formulario.TipoAtencionId,
            formulario.Codigo,
            formulario.Nombre,
            secciones);
    }

    public async Task<AtencionResponse> CrearRecepcionAtencionAsync(
        CrearRecepcionAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);

        var formulario = await GetFormularioActivoAsync(request.TipoAtencionId, cancellationToken)
            ?? throw new BusinessException(
                "No existe un formulario clínico activo para el tipo de atención.");

        var camposRecepcion = formulario.Secciones
            .Where(x => x.Codigo == RecepcionSeccionCodigo)
            .SelectMany(x => x.Campos.Where(c => c.Visible))
            .ToList();

        ValidateRespuestasRequeridas(camposRecepcion, request.RespuestasFormulario);

        var campoMap = camposRecepcion.ToDictionary(x => x.Id);
        var respuestasPorCampo = request.RespuestasFormulario
            .GroupBy(x => x.FormularioCampoId)
            .ToDictionary(x => x.Key, x => x.Last());

        foreach (var respuesta in respuestasPorCampo.Values)
        {
            if (!campoMap.ContainsKey(respuesta.FormularioCampoId))
                throw new BusinessException("Uno o más campos no pertenecen al formulario de recepción.");
        }

        var now = DateTime.UtcNow;
        var numeroAtencion = await GenerateNumeroAtencionAsync(now.Year, cancellationToken);

        var entity = new AtencionEntity
        {
            NumeroAtencion = numeroAtencion,
            PacienteId = request.PacienteId,
            TipoAtencionId = request.TipoAtencionId,
            FormularioClinicoId = formulario.Id,
            MotivoConsulta = ExtractMotivoConsulta(camposRecepcion, respuestasPorCampo),
            FechaAtencion = now,
            FechaRecepcion = now,
            Estado = AtencionEstados.Recepcion
        };

        foreach (var (campoId, respuesta) in respuestasPorCampo)
        {
            var campo = campoMap[campoId];
            var entityRespuesta = MapRespuesta(campo, respuesta);

            if (entityRespuesta is not null)
                entity.Respuestas.Add(entityRespuesta);
        }

        context.Atenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        var workflowInstanceId = await workflowService.IniciarAtencionMedicaEnRecepcionAsync(
            entity.Id,
            cancellationToken);

        if (workflowInstanceId.HasValue)
        {
            entity.WorkflowInstanceId = workflowInstanceId;
            await context.SaveChangesAsync(cancellationToken);
        }

        return AtencionMappings.ToResponse(entity);
    }

    public async Task<IReadOnlyCollection<AtencionResponse>> GetPendientesAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => x.Estado == AtencionEstados.Recepcion)
            .OrderByDescending(x => x.FechaRecepcion)
            .ThenBy(x => x.NumeroAtencion)
            .Select(x => AtencionMappings.ToResponse(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<AtencionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => AtencionMappings.ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<FormularioClinico?> GetFormularioActivoAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        return await context.FormulariosClinicos
            .AsNoTracking()
            .Include(x => x.Secciones)
            .ThenInclude(x => x.Campos)
            .ThenInclude(x => x.TipoCampoFormulario)
            .Where(x => x.TipoAtencionId == tipoAtencionId && x.Activo)
            .OrderByDescending(x => x.Version)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static void ValidateRespuestasRequeridas(
        IReadOnlyCollection<FormularioCampo> camposRecepcion,
        IReadOnlyCollection<RespuestaFormularioItem> respuestas)
    {
        var respuestasMap = respuestas
            .GroupBy(x => x.FormularioCampoId)
            .ToDictionary(x => x.Key, x => x.Last());

        var errores = new List<string>();

        foreach (var campo in camposRecepcion.Where(x => x.EsRequerido))
        {
            if (!respuestasMap.TryGetValue(campo.Id, out var respuesta) ||
                !TieneValor(respuesta, campo.TipoCampoFormulario.TipoDato))
            {
                errores.Add($"El campo '{campo.Etiqueta}' es requerido.");
            }
        }

        if (errores.Count > 0)
            throw new BusinessException(string.Join(' ', errores));
    }

    private static bool TieneValor(RespuestaFormularioItem respuesta, string tipoDato)
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

    private static AtencionFormularioRespuesta? MapRespuesta(
        FormularioCampo campo,
        RespuestaFormularioItem respuesta)
    {
        if (!TieneValor(respuesta, campo.TipoCampoFormulario.TipoDato))
            return null;

        return new AtencionFormularioRespuesta
        {
            FormularioCampoId = campo.Id,
            ValorTexto = NormalizeOptional(respuesta.ValorTexto),
            ValorNumero = respuesta.ValorNumero,
            ValorFecha = respuesta.ValorFecha,
            ValorBooleano = respuesta.ValorBooleano,
            ValorJson = NormalizeOptional(respuesta.ValorJson)
        };
    }

    private static string? ExtractMotivoConsulta(
        IReadOnlyCollection<FormularioCampo> campos,
        IReadOnlyDictionary<Guid, RespuestaFormularioItem> respuestas)
    {
        var campoMotivo = campos.FirstOrDefault(x => x.Codigo == "motivo_consulta");

        if (campoMotivo is null ||
            !respuestas.TryGetValue(campoMotivo.Id, out var respuesta) ||
            string.IsNullOrWhiteSpace(respuesta.ValorTexto))
        {
            return null;
        }

        return respuesta.ValorTexto.Trim();
    }

    private async Task<string> GenerateNumeroAtencionAsync(
        int year,
        CancellationToken cancellationToken)
    {
        var prefix = $"AT-{year}-";

        var lastNumber = await context.Atenciones
            .AsNoTracking()
            .Where(x => x.NumeroAtencion.StartsWith(prefix))
            .OrderByDescending(x => x.NumeroAtencion)
            .Select(x => x.NumeroAtencion)
            .FirstOrDefaultAsync(cancellationToken);

        var nextSequence = 1;

        if (lastNumber is not null)
        {
            var suffix = lastNumber[prefix.Length..];
            if (int.TryParse(suffix, out var parsed))
                nextSequence = parsed + 1;
        }

        return $"{prefix}{nextSequence:D6}";
    }

    private async Task EnsurePacienteExistsAsync(
        Guid pacienteId,
        CancellationToken cancellationToken)
    {
        if (!await context.Set<Paciente>().AnyAsync(x => x.Id == pacienteId, cancellationToken))
            throw new BusinessException("El paciente no existe.");
    }

    private async Task EnsureTipoAtencionExistsAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        if (!await context.TiposAtencion.AnyAsync(x => x.Id == tipoAtencionId, cancellationToken))
            throw new BusinessException("El tipo de atención no existe.");
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
