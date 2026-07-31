using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Resultados;
using Clinica.Modules.Laboratorio.Domain.Constants;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class ResultadoService(
    LaboratorioDbContext context,
    IWorkflowInstanceService workflowInstanceService) : IResultadoService
{
    private const string NotFoundMessage = "Resultado no encontrado.";
    private const string EstadoRegistrado = "REGISTRADO";
    private const string EstadoValidado = "VALIDADO";
    private const string EstadoEntregado = "ENTREGADO";
    private const int ObservacionesMaxLength = 1000;
    private const string WorkflowDefinitionCode = "LABORATORIO";
    private const string ReferenceModule = "Laboratorio";
    private const string ReferenceEntity = "Solicitud";

    public async Task<PagedResult<ResultadoResponse>> GetPagedAsync(
        ResultadoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Resultados.AsNoTracking();

        if (request.SolicitudId is { } solicitudId && solicitudId != Guid.Empty)
            query = query.Where(x => x.SolicitudId == solicitudId);

        if (!string.IsNullOrWhiteSpace(request.Estado))
        {
            var estado = request.Estado.Trim().ToUpperInvariant();
            query = query.Where(x => x.Estado == estado);
        }

        var ordered = query.OrderByDescending(x => x.CreatedAt);

        var idsPaged = await ordered
            .Select(x => x.Id)
            .ToPagedResultAsync(request, cancellationToken);

        var ids = idsPaged.Items.ToList();

        if (ids.Count == 0)
            return new PagedResult<ResultadoResponse>([], idsPaged.TotalRecords, idsPaged.Page, idsPaged.PageSize);

        var entities = await LoadWithDetallesAsync(x => ids.Contains(x.Id), cancellationToken);
        var byId = entities.ToDictionary(x => x.Id);

        var items = ids
            .Where(byId.ContainsKey)
            .Select(id => MapToResponse(byId[id]))
            .ToList();

        return new PagedResult<ResultadoResponse>(items, idsPaged.TotalRecords, idsPaged.Page, idsPaged.PageSize);
    }

    public async Task<ResultadoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = (await LoadWithDetallesAsync(x => x.Id == id, cancellationToken)).FirstOrDefault();

        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<ResultadoResponse> RegistrarAsync(
        Guid solicitudId,
        RegistrarResultadosRequest request,
        CancellationToken cancellationToken = default)
    {
        var solicitud = await context.Solicitudes
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Prueba)
            .FirstOrDefaultAsync(x => x.Id == solicitudId, cancellationToken)
            ?? throw new NotFoundException("Solicitud no encontrada.");

        if (solicitud.Estado != SolicitudEstados.MuestraTomada && solicitud.Estado != SolicitudEstados.EnProceso)
            throw new BusinessException(
                $"La solicitud debe tener la muestra tomada o estar en proceso para registrar resultados (estado actual: {solicitud.Estado}).");

        if (request.MuestraId is { } muestraId)
        {
            var muestraExiste = await context.Muestras
                .AnyAsync(x => x.Id == muestraId && x.SolicitudId == solicitudId, cancellationToken);

            if (!muestraExiste)
                throw new BusinessException("La muestra indicada no pertenece a la solicitud.");
        }

        var detallesPorId = solicitud.Detalles.ToDictionary(x => x.Id);

        var parametroIds = request.Lineas.Select(l => l.ParametroId).Distinct().ToList();
        var parametros = await context.Parametros
            .Include(x => x.ValoresReferencia)
            .Where(x => parametroIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        if (parametros.Count != parametroIds.Count)
            throw new BusinessException("Uno o más parámetros indicados no existen.");

        var detalles = new List<ResultadoDetalle>();

        foreach (var linea in request.Lineas)
        {
            if (!detallesPorId.TryGetValue(linea.SolicitudDetalleId, out var solicitudDetalle))
                throw new BusinessException("Uno o más detalles de solicitud indicados no pertenecen a la solicitud.");

            var parametro = parametros[linea.ParametroId];

            if (parametro.PruebaId != solicitudDetalle.PruebaId)
                throw new BusinessException(
                    $"El parámetro '{parametro.Nombre}' no corresponde a la prueba de la línea indicada.");

            var fueraDeRango = CalcularFueraDeRango(parametro, linea.ValorNumerico);

            detalles.Add(new ResultadoDetalle
            {
                ParametroId = parametro.Id,
                SolicitudDetalleId = solicitudDetalle.Id,
                ValorNumerico = linea.ValorNumerico,
                ValorTexto = StringNormalize.Optional(linea.ValorTexto),
                FueraDeRango = fueraDeRango,
                Observaciones = StringNormalize.Optional(linea.Observaciones),
            });
        }

        var resultado = new Resultado
        {
            SolicitudId = solicitudId,
            MuestraId = request.MuestraId,
            Estado = EstadoRegistrado,
            Observaciones = StringNormalize.Optional(request.Observaciones),
            Detalles = detalles,
        };

        context.Resultados.Add(resultado);

        var instance = solicitud.WorkflowInstanceId.HasValue
            ? await workflowInstanceService.GetByIdAsync(solicitud.WorkflowInstanceId.Value, cancellationToken)
            : await workflowInstanceService.GetByReferenceAsync(
                ReferenceModule,
                ReferenceEntity,
                solicitud.Id,
                cancellationToken);

        instance ??= await workflowInstanceService.StartAsync(
            new StartWorkflowInstanceRequest(
                WorkflowDefinitionCode,
                ReferenceModule,
                ReferenceEntity,
                solicitud.Id,
                request.EmpleadoId),
            cancellationToken);

        solicitud.WorkflowInstanceId = instance.Id;

        if (string.Equals(instance.CurrentStateCode, SolicitudEstados.MuestraTomada, StringComparison.OrdinalIgnoreCase))
        {
            instance = await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "INICIAR_PROCESO",
                    request.EmpleadoId,
                    "Inicio de procesamiento de la muestra."),
                cancellationToken);
        }

        if (string.Equals(instance.CurrentStateCode, SolicitudEstados.EnProceso, StringComparison.OrdinalIgnoreCase))
        {
            await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "REGISTRAR_RESULTADO",
                    request.EmpleadoId,
                    "Resultado registrado."),
                cancellationToken);
        }

        solicitud.Estado = SolicitudEstados.ResultadoRegistrado;
        solicitud.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(resultado.Id, cancellationToken))!;
    }

    public async Task<ResultadoResponse> ValidarAsync(
        Guid resultadoId,
        ValidarResultadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var resultado = await context.Resultados
            .Include(x => x.Solicitud)
            .FirstOrDefaultAsync(x => x.Id == resultadoId, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);

        if (resultado.Estado != EstadoRegistrado)
            throw new BusinessException(
                $"El resultado debe estar registrado para poder validarse (estado actual: {resultado.Estado}).");

        resultado.ValidadoPorEmpleadoId = request.EmpleadoId;
        resultado.FechaValidacion = DateTime.UtcNow;
        resultado.Estado = EstadoValidado;

        if (!string.IsNullOrWhiteSpace(request.Observaciones))
            resultado.Observaciones = AppendObservaciones(resultado.Observaciones, request.Observaciones);

        resultado.UpdatedAt = DateTime.UtcNow;

        var solicitud = resultado.Solicitud;

        var instance = solicitud.WorkflowInstanceId.HasValue
            ? await workflowInstanceService.GetByIdAsync(solicitud.WorkflowInstanceId.Value, cancellationToken)
            : await workflowInstanceService.GetByReferenceAsync(
                ReferenceModule,
                ReferenceEntity,
                solicitud.Id,
                cancellationToken);

        if (instance is not null &&
            string.Equals(instance.CurrentStateCode, SolicitudEstados.ResultadoRegistrado, StringComparison.OrdinalIgnoreCase))
        {
            await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "VALIDAR",
                    request.EmpleadoId,
                    "Resultado validado."),
                cancellationToken);
        }

        solicitud.Estado = SolicitudEstados.Validado;
        solicitud.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(resultado.Id, cancellationToken))!;
    }

    public async Task<ResultadoResponse> EntregarAsync(
        Guid resultadoId,
        EntregarResultadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var resultado = await context.Resultados
            .Include(x => x.Solicitud)
            .FirstOrDefaultAsync(x => x.Id == resultadoId, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);

        if (resultado.Estado != EstadoValidado)
            throw new BusinessException(
                $"El resultado debe estar validado para poder entregarse (estado actual: {resultado.Estado}).");

        var solicitud = resultado.Solicitud;

        if (!string.Equals(solicitud.Estado, SolicitudEstados.Validado, StringComparison.OrdinalIgnoreCase))
            throw new BusinessException(
                $"La solicitud debe estar validada para entregar el resultado (estado actual: {solicitud.Estado}).");

        if (!string.IsNullOrWhiteSpace(request.Observaciones))
            resultado.Observaciones = AppendObservaciones(resultado.Observaciones, request.Observaciones);

        resultado.Estado = EstadoEntregado;
        resultado.UpdatedAt = DateTime.UtcNow;

        var instance = solicitud.WorkflowInstanceId.HasValue
            ? await workflowInstanceService.GetByIdAsync(solicitud.WorkflowInstanceId.Value, cancellationToken)
            : await workflowInstanceService.GetByReferenceAsync(
                ReferenceModule,
                ReferenceEntity,
                solicitud.Id,
                cancellationToken);

        if (instance is not null &&
            string.Equals(instance.CurrentStateCode, SolicitudEstados.Validado, StringComparison.OrdinalIgnoreCase))
        {
            await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "ENTREGAR",
                    request.EmpleadoId,
                    "Resultado entregado."),
                cancellationToken);
        }

        solicitud.Estado = SolicitudEstados.Entregado;
        solicitud.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(resultado.Id, cancellationToken))!;
    }

    private static string AppendObservaciones(string? existing, string addition)
    {
        var trimmed = addition.Trim();
        var combined = string.IsNullOrWhiteSpace(existing)
            ? trimmed
            : $"{existing} | {trimmed}";

        if (combined.Length > ObservacionesMaxLength)
            throw new BusinessException(
                $"Las observaciones no pueden superar {ObservacionesMaxLength} caracteres al concatenarse.");

        return combined;
    }

    private static bool CalcularFueraDeRango(Parametro parametro, decimal? valorNumerico)
    {
        if (!string.Equals(parametro.TipoDato, ParametroTiposDato.Numerico, StringComparison.OrdinalIgnoreCase))
            return false;

        if (valorNumerico is not { } valor)
            return false;

        var referencia = parametro.ValoresReferencia
            .Where(v => v.Activo && (v.ValorMin.HasValue || v.ValorMax.HasValue))
            .OrderBy(v => v.Sexo == null && v.EdadMin == null && v.EdadMax == null ? 0 : 1)
            .FirstOrDefault();

        if (referencia is null)
            return false;

        if (referencia.ValorMin.HasValue && valor < referencia.ValorMin.Value)
            return true;

        if (referencia.ValorMax.HasValue && valor > referencia.ValorMax.Value)
            return true;

        return false;
    }

    private Task<List<Resultado>> LoadWithDetallesAsync(
        System.Linq.Expressions.Expression<Func<Resultado, bool>> predicate,
        CancellationToken cancellationToken)
    {
        return context.Resultados
            .AsNoTracking()
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Parametro)
            .Where(predicate)
            .ToListAsync(cancellationToken);
    }

    private static ResultadoResponse MapToResponse(Resultado entity)
    {
        var detalles = entity.Detalles
            .OrderBy(d => d.CreatedAt)
            .Select(d => new ResultadoDetalleResponse(
                d.Id,
                d.ParametroId,
                d.Parametro.Nombre,
                d.SolicitudDetalleId,
                d.ValorNumerico,
                d.ValorTexto,
                d.FueraDeRango,
                d.Observaciones))
            .ToList();

        return new ResultadoResponse(
            entity.Id,
            entity.SolicitudId,
            entity.MuestraId,
            entity.Estado,
            entity.ValidadoPorEmpleadoId,
            entity.FechaValidacion,
            entity.Observaciones,
            detalles);
    }
}
