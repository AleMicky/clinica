using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cargos;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Solicitudes;
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

public sealed class SolicitudService(
    LaboratorioDbContext context,
    ICorrelativoService correlativoService,
    ICajaCargoService cajaCargoService,
    IWorkflowInstanceService workflowInstanceService) : ISolicitudService
{
    private const string NotFoundMessage = "Solicitud no encontrada.";
    private const string PagoPendiente = "PENDIENTE";
    private const string WorkflowDefinitionCode = "LABORATORIO";
    private const string ReferenceModule = "Laboratorio";
    private const string ReferenceEntity = "Solicitud";
    private const string CorrelativoCodigo = "LAB_SOLICITUD";

    public async Task<PagedResult<SolicitudResponse>> GetPagedAsync(
        SolicitudPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Solicitudes.AsNoTracking();

        if (request.PacienteId is { } pacienteId && pacienteId != Guid.Empty)
            query = query.Where(x => x.PacienteId == pacienteId);

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        if (!string.IsNullOrWhiteSpace(request.Estado))
        {
            var estado = request.Estado.Trim().ToUpperInvariant();
            query = query.Where(x => x.Estado == estado);
        }

        if (!string.IsNullOrWhiteSpace(request.Origen))
        {
            var origen = request.Origen.Trim().ToUpperInvariant();
            query = query.Where(x => x.Origen == origen);
        }

        var ordered = query
            .OrderByDescending(x => x.FechaSolicitud)
            .ThenByDescending(x => x.Numero);

        var idsPaged = await ordered
            .Select(x => x.Id)
            .ToPagedResultAsync(request, cancellationToken);

        var ids = idsPaged.Items.ToList();

        if (ids.Count == 0)
        {
            return new PagedResult<SolicitudResponse>([], idsPaged.TotalRecords, idsPaged.Page, idsPaged.PageSize);
        }

        var entities = await LoadWithDetallesAsync(x => ids.Contains(x.Id), cancellationToken);

        var byId = entities.ToDictionary(x => x.Id);
        var items = ids
            .Where(byId.ContainsKey)
            .Select(id => MapToResponse(byId[id]))
            .ToList();

        return new PagedResult<SolicitudResponse>(items, idsPaged.TotalRecords, idsPaged.Page, idsPaged.PageSize);
    }

    public async Task<SolicitudResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = (await LoadWithDetallesAsync(x => x.Id == id, cancellationToken)).FirstOrDefault();

        return entity is null ? null : MapToResponse(entity);
    }

    public async Task<SolicitudResponse> CreateAsync(
        CreateSolicitudRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Lineas.Count == 0)
            throw new BusinessException("Debe incluir al menos una línea de solicitud.");

        var (detalles, pruebas) = await BuildDetallesAsync(request.Lineas, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "LAB-", Longitud: 6),
            cancellationToken);

        var entity = new Solicitud
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            PacienteId = request.PacienteId,
            Origen = StringNormalize.Required(request.Origen).ToUpperInvariant(),
            AtencionId = request.AtencionId,
            MedicoSolicitanteId = request.MedicoSolicitanteId,
            MedicoExternoNombre = StringNormalize.Optional(request.MedicoExternoNombre),
            Estado = SolicitudEstados.Borrador,
            Observaciones = StringNormalize.Optional(request.Observaciones),
            FechaSolicitud = DateTime.UtcNow,
            Detalles = detalles,
        };

        var instance = await workflowInstanceService.StartAsync(
            new StartWorkflowInstanceRequest(
                WorkflowDefinitionCode,
                ReferenceModule,
                ReferenceEntity,
                entity.Id,
                request.EmpleadoId),
            cancellationToken);

        entity.WorkflowInstanceId = instance.Id;
        context.Solicitudes.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return MapCreatedResponse(entity, pruebas);
    }

    public async Task<SolicitudResponse> UpdateAsync(
        Guid id,
        UpdateSolicitudRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Lineas.Count == 0)
            throw new BusinessException("Debe incluir al menos una línea de solicitud.");

        var entity = await context.Solicitudes
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);

        EnsureEditable(entity);

        var existentes = entity.Detalles.ToList();
        context.SolicitudDetalles.RemoveRange(existentes);
        entity.Detalles.Clear();

        var (detalles, _) = await BuildDetallesAsync(request.Lineas, cancellationToken);
        foreach (var detalle in detalles)
            entity.Detalles.Add(detalle);

        entity.PacienteId = request.PacienteId;
        entity.Origen = StringNormalize.Required(request.Origen).ToUpperInvariant();
        entity.AtencionId = request.AtencionId;
        entity.MedicoSolicitanteId = request.MedicoSolicitanteId;
        entity.MedicoExternoNombre = StringNormalize.Optional(request.MedicoExternoNombre);
        entity.Observaciones = StringNormalize.Optional(request.Observaciones);
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(entity.Id, cancellationToken);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Solicitudes
            .Include(x => x.Detalles)
            .Include(x => x.Pagos)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);

        EnsureEditable(entity);

        if (entity.Pagos.Count > 0)
            throw new BusinessException("No se puede eliminar una solicitud con pagos asociados.");

        context.SolicitudDetalles.RemoveRange(entity.Detalles);
        context.Solicitudes.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<SolicitudResponse> EnviarACajaAsync(
        Guid id,
        EnviarACajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var solicitud = await context.Solicitudes
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Prueba)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);

        if (solicitud.Estado != SolicitudEstados.Borrador && solicitud.Estado != SolicitudEstados.PendientePago)
            throw new BusinessException(
                $"La solicitud debe estar en borrador para enviarse a caja (estado actual: {solicitud.Estado}).");

        if (solicitud.Detalles.Count == 0)
            throw new BusinessException("La solicitud no tiene líneas para enviar a caja.");

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

        if (string.Equals(instance.CurrentStateCode, SolicitudEstados.Borrador, StringComparison.OrdinalIgnoreCase))
        {
            instance = await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "ENVIAR_CAJA",
                    request.EmpleadoId,
                    "Enviado a caja desde solicitud de laboratorio."),
                cancellationToken);
        }

        var cuenta = await cajaCargoService.AgregarCargosAsync(
            new AgregarCargosRequest(
                solicitud.PacienteId,
                ReferenceModule,
                ReferenceEntity,
                solicitud.Id,
                instance.Id,
                $"Solicitud de laboratorio {solicitud.Numero}",
                solicitud.Detalles
                    .Select(d => new AgregarCargosLineaRequest(
                        d.Prueba.Nombre,
                        d.Prueba.Codigo,
                        d.Cantidad,
                        d.PrecioUnitario,
                        d.Id))
                    .ToList()),
            cancellationToken);

        var pagoPendiente = await context.SolicitudPagos
            .FirstOrDefaultAsync(
                x => x.SolicitudId == solicitud.Id && x.Estado == PagoPendiente,
                cancellationToken);

        if (pagoPendiente is null)
        {
            context.SolicitudPagos.Add(new SolicitudPago
            {
                SolicitudId = solicitud.Id,
                CuentaId = cuenta.Id,
                MontoTotal = cuenta.TotalCargos,
                FechaEnvio = DateTime.UtcNow,
                Estado = PagoPendiente,
            });
        }
        else
        {
            pagoPendiente.CuentaId = cuenta.Id;
            pagoPendiente.MontoTotal = cuenta.TotalCargos;
            pagoPendiente.UpdatedAt = DateTime.UtcNow;
        }

        solicitud.Estado = SolicitudEstados.PendientePago;
        solicitud.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(solicitud.Id, cancellationToken);
    }

    public async Task SetEstadoAsync(
        Guid id,
        string estado,
        CancellationToken cancellationToken = default)
    {
        var solicitud = await context.Solicitudes
            .Include(x => x.Pagos)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);

        var normalized = StringNormalize.Required(estado).ToUpperInvariant();
        solicitud.Estado = normalized;
        solicitud.UpdatedAt = DateTime.UtcNow;

        if (normalized == SolicitudEstados.PendienteMuestra)
        {
            foreach (var pago in solicitud.Pagos.Where(p => p.Estado == "PENDIENTE"))
            {
                pago.Estado = "PAGADO";
                pago.UpdatedAt = DateTime.UtcNow;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static void EnsureEditable(Solicitud entity)
    {
        if (entity.Estado != SolicitudEstados.Borrador)
        {
            throw new BusinessException(
                $"Solo se pueden modificar o eliminar solicitudes en borrador (estado actual: {entity.Estado}).");
        }
    }

    private async Task<(List<SolicitudDetalle> Detalles, Dictionary<Guid, Prueba> Pruebas)> BuildDetallesAsync(
        IReadOnlyList<CreateSolicitudLineaRequest> lineas,
        CancellationToken cancellationToken)
    {
        var pruebaIds = lineas.Select(l => l.PruebaId).Distinct().ToList();

        var pruebas = await context.Pruebas
            .AsNoTracking()
            .Where(x => pruebaIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        if (pruebas.Count != pruebaIds.Count)
            throw new BusinessException("Una o más pruebas indicadas no existen.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var preciosVigentes = await context.PruebaPrecios
            .AsNoTracking()
            .Where(x =>
                pruebaIds.Contains(x.PruebaId) &&
                x.FechaInicio <= today &&
                (x.FechaFin == null || x.FechaFin >= today))
            .ToListAsync(cancellationToken);

        var precioPorPrueba = preciosVigentes
            .GroupBy(x => x.PruebaId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderByDescending(x => x.FechaInicio).First());

        var detalles = new List<SolicitudDetalle>(lineas.Count);

        foreach (var linea in lineas)
        {
            var prueba = pruebas[linea.PruebaId];

            if (!precioPorPrueba.TryGetValue(prueba.Id, out var precio))
                throw new BusinessException($"La prueba '{prueba.Nombre}' no tiene un precio vigente.");

            detalles.Add(new SolicitudDetalle
            {
                Id = Guid.NewGuid(),
                PruebaId = prueba.Id,
                PrecioUnitario = precio.ImporteFacturado,
                Cantidad = linea.Cantidad,
                EsDerivada = false,
                Observaciones = StringNormalize.Optional(linea.Observaciones),
            });
        }

        return (detalles, pruebas);
    }

    private static SolicitudResponse MapCreatedResponse(
        Solicitud entity,
        IReadOnlyDictionary<Guid, Prueba> pruebas)
    {
        var detalles = entity.Detalles
            .Select(d => new SolicitudDetalleResponse(
                d.Id,
                d.PruebaId,
                pruebas[d.PruebaId].Nombre,
                d.PrecioUnitario,
                d.Cantidad,
                d.EsDerivada,
                d.Observaciones))
            .ToList();

        return new SolicitudResponse(
            entity.Id,
            entity.Numero,
            entity.PacienteId,
            entity.Origen,
            entity.AtencionId,
            entity.MedicoSolicitanteId,
            entity.MedicoExternoNombre,
            entity.Estado,
            entity.Observaciones,
            entity.FechaSolicitud,
            detalles,
            []);
    }

    private async Task<SolicitudResponse> GetRequiredResponseAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(NotFoundMessage);
    }

    private Task<List<Solicitud>> LoadWithDetallesAsync(
        System.Linq.Expressions.Expression<Func<Solicitud, bool>> predicate,
        CancellationToken cancellationToken)
    {
        return context.Solicitudes
            .AsNoTracking()
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Prueba)
            .Include(x => x.Pagos)
            .Where(predicate)
            .ToListAsync(cancellationToken);
    }

    private static SolicitudResponse MapToResponse(Solicitud entity)
    {
        var detalles = entity.Detalles
            .OrderBy(d => d.CreatedAt)
            .Select(d => new SolicitudDetalleResponse(
                d.Id,
                d.PruebaId,
                d.Prueba.Nombre,
                d.PrecioUnitario,
                d.Cantidad,
                d.EsDerivada,
                d.Observaciones))
            .ToList();

        var pagos = entity.Pagos
            .OrderBy(p => p.FechaEnvio)
            .Select(p => new SolicitudPagoResponse(
                p.Id,
                p.CuentaId,
                p.MontoTotal,
                p.FechaEnvio,
                p.Estado))
            .ToList();

        return new SolicitudResponse(
            entity.Id,
            entity.Numero,
            entity.PacienteId,
            entity.Origen,
            entity.AtencionId,
            entity.MedicoSolicitanteId,
            entity.MedicoExternoNombre,
            entity.Estado,
            entity.Observaciones,
            entity.FechaSolicitud,
            detalles,
            pagos);
    }
}
