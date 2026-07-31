using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Muestras;
using Clinica.Modules.Laboratorio.Domain.Constants;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class MuestraService(
    LaboratorioDbContext context,
    ICorrelativoService correlativoService,
    IWorkflowInstanceService workflowInstanceService) : IMuestraService
{
    private const string NotFoundMessage = "Muestra no encontrada.";
    private const string EstadoTomada = "TOMADA";
    private const string WorkflowDefinitionCode = "LABORATORIO";
    private const string ReferenceModule = "Laboratorio";
    private const string ReferenceEntity = "Solicitud";
    private const string CorrelativoCodigo = "LAB_MUESTRA";

    public async Task<PagedResult<MuestraResponse>> GetPagedAsync(
        MuestraPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Muestras.AsNoTracking();

        if (request.SolicitudId is { } solicitudId && solicitudId != Guid.Empty)
            query = query.Where(x => x.SolicitudId == solicitudId);

        if (!string.IsNullOrWhiteSpace(request.Estado))
        {
            var estado = request.Estado.Trim().ToUpperInvariant();
            query = query.Where(x => x.Estado == estado);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Codigo.Contains(search));
        }

        var ordered = query.OrderByDescending(x => x.FechaToma);

        var idsPaged = await ordered
            .Select(x => x.Id)
            .ToPagedResultAsync(request, cancellationToken);

        var ids = idsPaged.Items.ToList();

        if (ids.Count == 0)
            return new PagedResult<MuestraResponse>([], idsPaged.TotalRecords, idsPaged.Page, idsPaged.PageSize);

        var entities = await LoadWithDetallesAsync(x => ids.Contains(x.Id), cancellationToken);
        var byId = entities.ToDictionary(x => x.Id);

        var items = ids
            .Where(byId.ContainsKey)
            .Select(id => MapToResponse(byId[id]))
            .ToList();

        return new PagedResult<MuestraResponse>(items, idsPaged.TotalRecords, idsPaged.Page, idsPaged.PageSize);
    }

    public async Task<MuestraResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = (await LoadWithDetallesAsync(x => x.Id == id, cancellationToken)).FirstOrDefault();

        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<MuestraResponse> TomarMuestraAsync(
        Guid solicitudId,
        TomarMuestraRequest request,
        CancellationToken cancellationToken = default)
    {
        var solicitud = await context.Solicitudes
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == solicitudId, cancellationToken)
            ?? throw new NotFoundException("Solicitud no encontrada.");

        if (solicitud.Estado != SolicitudEstados.PendienteMuestra && solicitud.Estado != SolicitudEstados.MuestraTomada)
            throw new BusinessException(
                $"La solicitud debe estar pendiente de toma de muestra (estado actual: {solicitud.Estado}).");

        var candidatos = solicitud.Detalles.Where(d => !d.EsDerivada).ToList();

        if (request.SolicitudDetalleIds is { Count: > 0 } solicitudDetalleIds)
        {
            var candidatoIds = candidatos.Select(d => d.Id).ToHashSet();

            var invalidos = solicitudDetalleIds.Where(id => !candidatoIds.Contains(id)).ToList();
            if (invalidos.Count > 0)
                throw new BusinessException("Uno o más detalles indicados no pertenecen a la solicitud o son derivados.");

            candidatos = candidatos.Where(d => solicitudDetalleIds.Contains(d.Id)).ToList();
        }

        var yaTomados = await context.MuestraDetalles
            .AsNoTracking()
            .Where(x => x.Muestra.SolicitudId == solicitudId)
            .Select(x => x.SolicitudDetalleId)
            .ToListAsync(cancellationToken);

        var pendientes = candidatos.Where(d => !yaTomados.Contains(d.Id)).ToList();

        if (pendientes.Count == 0)
            throw new BusinessException("No hay líneas pendientes de toma de muestra para esta solicitud.");

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "MUE-", Longitud: 6),
            cancellationToken);

        var muestra = new Muestra
        {
            SolicitudId = solicitudId,
            Codigo = correlativo.NumeroFormateado,
            TipoMuestraId = request.TipoMuestraId,
            FechaToma = DateTime.UtcNow,
            TomadoPorEmpleadoId = request.TomadoPorEmpleadoId,
            Estado = EstadoTomada,
            Observaciones = StringNormalize.Optional(request.Observaciones),
            Detalles = pendientes
                .Select(d => new MuestraDetalle
                {
                    SolicitudDetalleId = d.Id,
                    Estado = EstadoTomada,
                })
                .ToList(),
        };

        context.Muestras.Add(muestra);
        await context.SaveChangesAsync(cancellationToken);

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
                request.TomadoPorEmpleadoId),
            cancellationToken);

        solicitud.WorkflowInstanceId = instance.Id;

        if (string.Equals(instance.CurrentStateCode, SolicitudEstados.PendienteMuestra, StringComparison.OrdinalIgnoreCase))
        {
            await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "TOMAR_MUESTRA",
                    request.TomadoPorEmpleadoId,
                    "Muestra tomada."),
                cancellationToken);
        }

        solicitud.Estado = SolicitudEstados.MuestraTomada;
        solicitud.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(muestra.Id, cancellationToken))!;
    }

    private Task<List<Muestra>> LoadWithDetallesAsync(
        System.Linq.Expressions.Expression<Func<Muestra, bool>> predicate,
        CancellationToken cancellationToken)
    {
        return context.Muestras
            .AsNoTracking()
            .Include(x => x.Detalles)
                .ThenInclude(d => d.SolicitudDetalle)
                    .ThenInclude(sd => sd.Prueba)
            .Where(predicate)
            .ToListAsync(cancellationToken);
    }

    private static MuestraResponse MapToResponse(Muestra entity)
    {
        var detalles = entity.Detalles
            .OrderBy(d => d.CreatedAt)
            .Select(d => new MuestraDetalleResponse(
                d.Id,
                d.SolicitudDetalleId,
                d.SolicitudDetalle.PruebaId,
                d.SolicitudDetalle.Prueba.Nombre,
                d.Estado))
            .ToList();

        return new MuestraResponse(
            entity.Id,
            entity.SolicitudId,
            entity.Codigo,
            entity.TipoMuestraId,
            entity.FechaToma,
            entity.TomadoPorEmpleadoId,
            entity.Estado,
            entity.Observaciones,
            detalles);
    }
}
