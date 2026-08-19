using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using VentaEntity = Clinica.Api.Modules.Ventas.Venta.Entity.Venta;
using VentaDetalleEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaDetalle;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Ventas.Venta.Services;

public sealed class VentaService(
    AppDbContext dbContext,
    CorrelativoService correlativoService
)
{
    private DbSet<VentaEntity> Entities => dbContext.Set<VentaEntity>();

    public async Task<PagedResult<VentaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = Entities
            .AsNoTracking()
            .WithFullDetails()
            .Where(x => x.Activo);

        query = ApplySearch(query, search?.Trim());

        var totalItems = await query.CountAsync(cancellationToken);
        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await ApplyOrder(query)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<VentaResponse>(
            VentaMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<VentaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .AsNoTracking()
            .WithFullDetails()
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return VentaMapper.ToResponse(entity);
    }

    public async Task<VentaResponse> CrearAsync(
        CreateVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarVentaContextoAsync(
            request.AdmisionId,
            request.PacienteId,
            request.VendedorId,
            request.MonedaId,
            request.Detalles,
            request.Pagadores,
            cancellationToken);

        var entity = await MapToNewEntityAsync(request, cancellationToken);
        entity.Activo = true;

        await using var tx = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var correlativo = await correlativoService.GenerarAsync(
                new GenerarCorrelativoRequest
                {
                    Codigo = "VTA",
                    Gestion = entity.Fecha.Year,
                    Prefijo = "VTA",
                    Longitud = 6
                },
                cancellationToken);

            entity.Numero = correlativo.NumeroFormateado;

            await Entities.AddAsync(entity, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<VentaResponse> ActualizarAsync(
        int id,
        UpdateVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.Detalles)
            .Include(x => x.Pagadores)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (entity.Estado != EstadoVenta.Pendiente)
        {
            throw new ConflictException(
                $"No se puede editar una venta en estado {entity.Estado}. Solo las ventas en estado {EstadoVenta.Pendiente} pueden ser editadas.");
        }

        await ValidarVentaContextoAsync(
            request.AdmisionId,
            request.PacienteId,
            request.VendedorId,
            request.MonedaId,
            request.Detalles,
            request.Pagadores,
            cancellationToken);

        await MapToExistingEntityAsync(request, entity, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.Detalles)
            .Include(x => x.Pagadores)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (entity.Estado == EstadoVenta.Anulada)
            throw new ConflictException("La venta ya está anulada.");

        entity.Estado = EstadoVenta.Anulada;
        entity.Activo = false;

        foreach (var detalle in entity.Detalles)
            detalle.Activo = false;

        foreach (var pagador in entity.Pagadores)
        {
            pagador.Estado = EstadoVentaPagador.Anulado;
            pagador.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<VentaResponse> CambiarEstadoAsync(
        int id,
        CambiarEstadoVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var entity = await Entities.
                Include(x => x.Detalles)
                .FirstOrDefaultAsync(x
                    => x.Id == id && x.Activo,
                cancellationToken);

            if (entity is null)
                throw CreateNotFoundException(id);

            if (!VentaTransiciones.EsValida(entity.Estado, request.EstadoDestino))
            {
                throw new ConflictException($"No se puede transitar de {entity.Estado} a {request.EstadoDestino}.");
            }

            if (request.EstadoDestino == EstadoVenta.Pagada)
            {
                
            }

            entity.Estado = request.EstadoDestino;

            await dbContext.SaveChangesAsync(
                cancellationToken
            );

            await transaction.CommitAsync(
                cancellationToken
            );
            return await ObtenerAsync(entity.Id, cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        } 
    }

    public async Task<VentaResponse> GenerarVentaDesdeAdmisionAsync(
        int admisionId,
        int vendedorId,
        CancellationToken cancellationToken = default)
    {
        var admision = await dbContext.Admisiones
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == admisionId && x.Activo, cancellationToken);

        if (admision is null)
            throw new NotFoundException(nameof(Admision), admisionId);

        if (admision.Estado != EstadoAdmision.Confirmada)
            throw new ConflictException("La admisión debe estar confirmada para generar la venta.");

        var existeVenta = await Entities.AnyAsync(x => x.AdmisionId == admisionId && x.Activo, cancellationToken);
        if (existeVenta)
            throw new ConflictException("La admisión ya tiene una venta generada.");

        await EnsureVendedorExistsAsync(vendedorId, cancellationToken);

        var detallesAdmision = admision.Detalles.Where(x => x.Activo).ToList();
        if (detallesAdmision.Count == 0)
            throw new ConflictException("La admisión no tiene servicios activos para generar la venta.");

        var moneda = await dbContext.Monedas
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.EsBase && x.Activo, cancellationToken);

        if (moneda is null)
            throw new ConflictException("No existe una moneda base configurada.");

        var pairs = detallesAdmision
            .Where(x => x.MedicoId.HasValue)
            .Select(x => (x.MedicoId!.Value, x.ServicioId))
            .Distinct();

        var acuerdosMap = await CargarAcuerdosMedicosMapAsync(pairs, cancellationToken);

        var entity = new VentaEntity
        {
            AdmisionId = admision.Id,
            PacienteId = admision.PacienteId,
            VendedorId = vendedorId,
            MonedaId = moneda.Id,
            Fecha = DateTime.Now,
            Estado = EstadoVenta.Pendiente,
            Activo = true,
            Detalles = [],
            Pagadores = []
        };

        foreach (var detalle in detallesAdmision)
        {
            var (montoMedico, montoClinica) =
                CalcularMontosMedico(detalle.MedicoId, detalle.ServicioId, detalle.Cantidad, acuerdosMap);

            entity.Detalles.Add(new VentaDetalleEntity
            {
                ServicioId = detalle.ServicioId,
                MedicoId = detalle.MedicoId,
                Cantidad = detalle.Cantidad,
                PrecioUnitario = detalle.PrecioUnitario,
                Descuento = detalle.Descuento,
                Total = detalle.Total,
                MontoMedico = montoMedico,
                MontoClinica = montoClinica,
                Activo = true
            });
        }

        CalcularTotales(entity);

        entity.Pagadores.Add(new VentaPagadorEntity
        {
            Tipo = admision.ConvenioId is null ? TipoPagador.Paciente : TipoPagador.Convenio,
            ConvenioId = admision.ConvenioId,
            Monto = entity.Total,
            Estado = EstadoVentaPagador.Pendiente,
            Activo = true
        });

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "VTA",
                Gestion = entity.Fecha.Year,
                Prefijo = "VTA",
                Longitud = 6
            },
            cancellationToken);

        entity.Numero = correlativo.NumeroFormateado;

        await Entities.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    private static IQueryable<VentaEntity> ApplyOrder(IQueryable<VentaEntity> query) =>
        query.OrderByDescending(x => x.Fecha).ThenByDescending(x => x.Id);

    private async Task<VentaEntity> MapToNewEntityAsync(
        CreateVentaRequest request,
        CancellationToken cancellationToken)
    {
        var entity = VentaMapper.ToEntity(request);
        entity.Estado = EstadoVenta.Pendiente;
        entity.Detalles = [];

        var pairs = request.Detalles
            .Where(x => x.MedicoId.HasValue)
            .Select(x => (x.MedicoId!.Value, x.ServicioId))
            .Distinct();

        var acuerdosMap = await CargarAcuerdosMedicosMapAsync(pairs, cancellationToken);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle, acuerdosMap));
        }

        entity.Pagadores = request.Pagadores.Select(CrearPagador).ToList();
        CalcularTotales(entity);
        ValidarMontoPagadores(entity);

        return entity;
    }

    private async Task MapToExistingEntityAsync(
        UpdateVentaRequest request,
        VentaEntity entity,
        CancellationToken cancellationToken)
    {
        VentaMapper.UpdateEntity(request, entity);

        var pairs = request.Detalles
            .Where(x => x.MedicoId.HasValue)
            .Select(x => (x.MedicoId!.Value, x.ServicioId))
            .Distinct();

        var acuerdosMap = await CargarAcuerdosMedicosMapAsync(pairs, cancellationToken);

        ReemplazarDetalles(entity, request.Detalles, acuerdosMap);
        ReemplazarPagadores(entity, request.Pagadores);

        CalcularTotales(entity);
        ValidarMontoPagadores(entity);
    }

    private async Task ValidarVentaContextoAsync(
        int admisionId,
        int pacienteId,
        int vendedorId,
        int monedaId,
        IReadOnlyCollection<VentaDetalleRequest> detalles,
        IReadOnlyCollection<VentaPagadorRequest> pagadores,
        CancellationToken cancellationToken)
    {
        await EnsureAdmisionValidaAsync(admisionId, pacienteId, cancellationToken);
        await EnsurePacienteExistsAsync(pacienteId, cancellationToken);
        await EnsureVendedorExistsAsync(vendedorId, cancellationToken);
        await EnsureMonedaExistsAsync(monedaId, cancellationToken);
        await ValidarDetallesAsync(detalles, cancellationToken);
        await ValidarPagadoresAsync(pagadores, cancellationToken);
    }

    private static IQueryable<VentaEntity> ApplySearch(IQueryable<VentaEntity> query, string? search) =>
        string.IsNullOrWhiteSpace(search) ? query : query.Where(x => x.Numero.Contains(search));

    private static NotFoundException CreateNotFoundException(int id) =>
        new(nameof(VentaEntity), id);

    private async Task EnsureAdmisionValidaAsync(int admisionId, int pacienteId, CancellationToken cancellationToken)
    {
        var admision = await dbContext.Admisiones
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == admisionId && x.Activo, cancellationToken);

        if (admision is null)
            throw new NotFoundException(nameof(Admision), admisionId);

        if (admision.Estado == EstadoAdmision.Cancelada)
            throw new ConflictException("No se puede crear una venta para una admisión cancelada.");

        if (admision.PacienteId != pacienteId)
            throw new ConflictException("El paciente de la venta no coincide con el paciente de la admisión.");
    }

    private async Task EnsurePacienteExistsAsync(int pacienteId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Pacientes.AnyAsync(x => x.Id == pacienteId && x.Activo, cancellationToken))
            throw new NotFoundException(nameof(Paciente), pacienteId);
    }

    private async Task EnsureVendedorExistsAsync(int vendedorId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Empleados.AnyAsync(x => x.Id == vendedorId && x.Activo, cancellationToken))
            throw new NotFoundException(nameof(Empleado), vendedorId);
    }

    private async Task EnsureMonedaExistsAsync(int monedaId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Monedas.AnyAsync(x => x.Id == monedaId && x.Activo, cancellationToken))
            throw new NotFoundException(nameof(Moneda), monedaId);
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<VentaDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        if (detalles.Count == 0)
            throw new ConflictException("La venta debe tener al menos un detalle.");

        var servicioIds = detalles.Select(x => x.ServicioId).Distinct().ToList();
        var serviciosExistentes = await dbContext.Servicio
            .Where(x => servicioIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltanteServicio = servicioIds.Except(serviciosExistentes).FirstOrDefault();
        if (faltanteServicio != default)
            throw new NotFoundException(nameof(Servicio), faltanteServicio);

        var medicoIds = detalles.Where(x => x.MedicoId.HasValue).Select(x => x.MedicoId!.Value).Distinct().ToList();
        if (medicoIds.Count == 0) return;

        var medicosExistentes = await dbContext.Medicos
            .Where(x => medicoIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltanteMedico = medicoIds.Except(medicosExistentes).FirstOrDefault();
        if (faltanteMedico != default)
            throw new NotFoundException(nameof(Medico), faltanteMedico);
    }

    private async Task ValidarPagadoresAsync(
        IReadOnlyCollection<VentaPagadorRequest> pagadores,
        CancellationToken cancellationToken)
    {
        if (pagadores.Count == 0)
            throw new ConflictException("La venta debe tener al menos un pagador.");

        var convenioIds = pagadores
            .Where(x => x.Tipo == TipoPagador.Convenio && x.ConvenioId.HasValue)
            .Select(x => x.ConvenioId!.Value)
            .Distinct()
            .ToList();

        if (convenioIds.Count == 0) return;

        var conveniosExistentes = await dbContext.Convenios
            .Where(x => convenioIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltanteConvenio = convenioIds.Except(conveniosExistentes).FirstOrDefault();
        if (faltanteConvenio != default)
            throw new NotFoundException(nameof(Convenio), faltanteConvenio);
    }

    private static void ValidarMontoPagadores(VentaEntity entity)
    {
        var totalPagadores = entity.Pagadores.Where(x => x.Activo).Sum(x => x.Monto);
        if (Math.Round(totalPagadores, 2) != Math.Round(entity.Total, 2))
        {
            throw new ConflictException(
                $"La suma de los pagadores ({totalPagadores:F2}) no coincide con el total de la venta ({entity.Total:F2}).");
        }
    }

    private static VentaDetalleEntity CrearDetalle(
        VentaDetalleRequest request,
        IReadOnlyDictionary<(int MedicoId, int ServicioId), MedicoServicioAcuerdo> acuerdosMap)
    {
        var (montoMedico, montoClinica) =
            CalcularMontosMedico(request.MedicoId, request.ServicioId, request.Cantidad, acuerdosMap);

        return new VentaDetalleEntity
        {
            ServicioId = request.ServicioId,
            MedicoId = request.MedicoId,
            Cantidad = request.Cantidad,
            PrecioUnitario = request.PrecioUnitario,
            Descuento = request.Descuento,
            Total = VentaCalculos.TotalDetalle(request),
            MontoMedico = montoMedico,
            MontoClinica = montoClinica,
            Activo = true
        };
    }

    private static (decimal? MontoMedico, decimal? MontoClinica) CalcularMontosMedico(
        int? medicoId,
        int servicioId,
        decimal cantidad,
        IReadOnlyDictionary<(int MedicoId, int ServicioId), MedicoServicioAcuerdo> acuerdosMap)
    {
        if (!medicoId.HasValue)
            return (null, null);

        if (!acuerdosMap.TryGetValue((medicoId.Value, servicioId), out var acuerdo))
        {
            throw new ConflictException(
                $"El médico {medicoId.Value} no tiene un acuerdo vigente para el servicio {servicioId}.");
        }

        return (acuerdo.ImporteMedico * cantidad, acuerdo.ImporteClinica * cantidad);
    }

    private static VentaPagadorEntity CrearPagador(VentaPagadorRequest request) =>
        new()
        {
            Tipo = request.Tipo,
            ConvenioId = request.Tipo == TipoPagador.Convenio ? request.ConvenioId : null,
            Monto = request.Monto,
            Estado = EstadoVentaPagador.Pendiente,
            Activo = true
        };

    private static void ReemplazarDetalles(
        VentaEntity entity,
        IReadOnlyCollection<VentaDetalleRequest> detalles,
        IReadOnlyDictionary<(int MedicoId, int ServicioId), MedicoServicioAcuerdo> acuerdosMap)
    {
        var incomingServicioIds = detalles.Select(x => x.ServicioId).ToHashSet();

        foreach (var existing in entity.Detalles.Where(x => x.Activo && !incomingServicioIds.Contains(x.ServicioId)))
        {
            existing.Activo = false;
        }

        var existingByServicio = entity.Detalles.Where(x => x.Activo).ToDictionary(x => x.ServicioId);

        foreach (var request in detalles)
        {
            var (montoMedico, montoClinica) =
                CalcularMontosMedico(request.MedicoId, request.ServicioId, request.Cantidad, acuerdosMap);

            if (existingByServicio.TryGetValue(request.ServicioId, out var detalle))
            {
                detalle.MedicoId = request.MedicoId;
                detalle.Cantidad = request.Cantidad;
                detalle.PrecioUnitario = request.PrecioUnitario;
                detalle.Descuento = request.Descuento;
                detalle.Total = VentaCalculos.TotalDetalle(request);
                detalle.MontoMedico = montoMedico;
                detalle.MontoClinica = montoClinica;
            }
            else
            {
                entity.Detalles.Add(CrearDetalle(request, acuerdosMap));
            }
        }
    }

    private static void ReemplazarPagadores(
        VentaEntity entity,
        IReadOnlyCollection<VentaPagadorRequest> pagadores)
    {
        var incomingKeys = pagadores
            .Select(x => new PagadorKey(x.Tipo, x.Tipo == TipoPagador.Convenio ? x.ConvenioId : null))
            .ToHashSet();

        foreach (var existing in entity.Pagadores.Where(x =>
                     x.Activo && !incomingKeys.Contains(new PagadorKey(x.Tipo, x.ConvenioId))))
        {
            existing.Activo = false;
        }

        var existingActive = entity.Pagadores.Where(x => x.Activo).ToList();

        foreach (var request in pagadores)
        {
            var convenioId = request.Tipo == TipoPagador.Convenio ? request.ConvenioId : null;
            var match = existingActive.FirstOrDefault(x => x.Tipo == request.Tipo && x.ConvenioId == convenioId);

            if (match is not null)
            {
                match.Monto = request.Monto;
            }
            else
            {
                entity.Pagadores.Add(CrearPagador(request));
            }
        }
    }

    private async Task<Dictionary<(int MedicoId, int ServicioId), MedicoServicioAcuerdo>> CargarAcuerdosMedicosMapAsync(
        IEnumerable<(int MedicoId, int ServicioId)> pairs,
        CancellationToken cancellationToken)
    {
        var pairsList = pairs.ToList();
        if (pairsList.Count == 0)
            return [];

        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var medicoIds = pairsList.Select(p => p.MedicoId).Distinct().ToList();
        var servicioIds = pairsList.Select(p => p.ServicioId).Distinct().ToList();

        var acuerdos = await dbContext.MedicosServiciosAcuerdos
            .AsNoTracking()
            .Where(x =>
                medicoIds.Contains(x.MedicoId) &&
                servicioIds.Contains(x.ServicioId) &&
                x.Activo &&
                x.FechaInicio <= hoy &&
                (x.FechaFin == null || x.FechaFin >= hoy))
            .OrderByDescending(x => x.FechaInicio)
            .ToListAsync(cancellationToken);

        return acuerdos
            .GroupBy(x => (x.MedicoId, x.ServicioId))
            .ToDictionary(g => g.Key, g => g.First());
    }

    private static void CalcularTotales(VentaEntity entity)
    {
        var detallesActivos = entity.Detalles.Where(x => x.Activo).ToList();

        entity.Subtotal = detallesActivos.Sum(x => x.Cantidad * x.PrecioUnitario);
        entity.Descuento = detallesActivos.Sum(x => x.Descuento);
        entity.Total = detallesActivos.Sum(x => x.Total);
    }

    private readonly record struct PagadorKey(TipoPagador Tipo, int? ConvenioId);
}

public static class VentaQueryExtensions
{
    public static IQueryable<VentaEntity> WithFullDetails(this IQueryable<VentaEntity> query)
    {
        return query
            .Include(x => x.Paciente)
            .ThenInclude(p => p.Persona)
            .Include(x => x.Vendedor)
            .ThenInclude(e => e.Persona)
            .Include(x => x.Moneda)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Servicio)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Medico)
            .ThenInclude(m => m!.Empleado)
            .ThenInclude(e => e.Persona)
            .Include(x => x.Pagadores);
    }
}