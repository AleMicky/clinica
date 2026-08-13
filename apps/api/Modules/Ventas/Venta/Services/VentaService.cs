using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using VentaEntity = Clinica.Api.Modules.Ventas.Venta.Entity.Venta;
using VentaDetalleEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaDetalle;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Ventas.Venta.Services;

public sealed class VentaService(
    AppDbContext dbContext,
    CorrelativoService correlativoService
)
    : CrudService<
        VentaEntity,
        CreateVentaRequest,
        UpdateVentaRequest,
        VentaResponse
    >(dbContext)
{
    public override async Task<VentaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .AsNoTracking()
            .Include(x => x.Detalles)
            .Include(x => x.Pagadores)
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity) with
        {
            Detalles = VentaDetalleMapper.ToResponse(
                entity.Detalles.Where(x => x.Activo)),
            Pagadores = VentaPagadorMapper.ToResponse(
                entity.Pagadores.Where(x => x.Activo))
        };
    }

    public override async Task<VentaResponse> CrearAsync(
        CreateVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateCreateAsync(request, cancellationToken);

        var entity = MapToNewEntity(request);

        entity.Activo = true;

        await using var tx = await DbContext.Database
            .BeginTransactionAsync(cancellationToken);

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
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public override async Task<VentaResponse> ActualizarAsync(
        int id,
        UpdateVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.Detalles)
            .Include(x => x.Pagadores)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (entity.Estado != EstadoVenta.Pendiente)
        {
            throw new ConflictException(
                $"No se puede editar una venta en estado {entity.Estado}. " +
                $"Solo las ventas en estado {EstadoVenta.Pendiente} pueden ser editadas.");
        }

        await ValidateUpdateAsync(
            id,
            request,
            entity,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public override async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.Detalles)
            .Include(x => x.Pagadores)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (entity.Estado == EstadoVenta.Anulada)
        {
            throw new ConflictException(
                "La venta ya está anulada.");
        }

        entity.Estado = EstadoVenta.Anulada;
        entity.Activo = false;

        foreach (var pagador in entity.Pagadores.Where(x => x.Activo))
        {
            pagador.Estado = EstadoVentaPagador.Anulado;
        }

        await DbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<VentaResponse> CambiarEstadoAsync(
        int id,
        CambiarEstadoVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.Detalles)
            .Include(x => x.Pagadores)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (!VentaTransiciones.EsValida(entity.Estado, request.EstadoDestino))
        {
            throw new ConflictException(
                $"No se puede transitar de {entity.Estado} a {request.EstadoDestino}.");
        }

        entity.Estado = request.EstadoDestino;

        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    protected override IQueryable<VentaEntity> ApplyOrder(
        IQueryable<VentaEntity> query)
    {
        return query
            .OrderByDescending(x => x.Fecha)
            .ThenByDescending(x => x.Id);
    }

    protected override VentaEntity MapToNewEntity(
        CreateVentaRequest request)
    {
        var entity = VentaMapper.ToEntity(request);

        entity.Estado = EstadoVenta.Pendiente;
        entity.Detalles = request.Detalles
            .Select(CrearDetalle)
            .ToList();
        entity.Pagadores = request.Pagadores
            .Select(CrearPagador)
            .ToList();

        CalcularTotales(entity);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateVentaRequest request,
        VentaEntity entity)
    {
        VentaMapper.UpdateEntity(request, entity);

        ReemplazarDetalles(entity, request.Detalles);
        ReemplazarPagadores(entity, request.Pagadores);

        CalcularTotales(entity);
    }

    protected override VentaResponse MapToResponse(
        VentaEntity entity)
    {
        return VentaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<VentaResponse> MapToResponseList(
        IEnumerable<VentaEntity> entities)
    {
        return VentaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateVentaRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureAdmisionValidaAsync(
            request.AdmisionId,
            request.PacienteId,
            cancellationToken);

        await EnsurePacienteExistsAsync(
            request.PacienteId,
            cancellationToken);

        await EnsureMonedaExistsAsync(
            request.MonedaId,
            cancellationToken);

        await ValidarDetallesAsync(
            request.Detalles,
            cancellationToken);

        await ValidarPagadoresAsync(
            request.Pagadores,
            cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateVentaRequest request,
        VentaEntity entity,
        CancellationToken cancellationToken)
    {
        await EnsureAdmisionValidaAsync(
            request.AdmisionId,
            request.PacienteId,
            cancellationToken);

        await EnsurePacienteExistsAsync(
            request.PacienteId,
            cancellationToken);

        await EnsureMonedaExistsAsync(
            request.MonedaId,
            cancellationToken);

        await ValidarDetallesAsync(
            request.Detalles,
            cancellationToken);

        await ValidarPagadoresAsync(
            request.Pagadores,
            cancellationToken);
    }

    protected override IQueryable<VentaEntity> ApplySearch(
        IQueryable<VentaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Numero.Contains(search));
    }

    private async Task EnsureAdmisionValidaAsync(
        int admisionId,
        int pacienteId,
        CancellationToken cancellationToken)
    {
        var admision = await DbContext.Admisiones
            .Include(x => x.Detalles)
            .Where(x => x.Id == admisionId && x.Activo)
            .FirstOrDefaultAsync(cancellationToken);

        if (admision is null)
            throw new NotFoundException(nameof(Admision), admisionId);

        if (admision.Estado == EstadoAdmision.Cancelada)
        {
            throw new ConflictException(
                "No se puede crear una venta para una admisión cancelada.");
        }

        if (admision.PacienteId != pacienteId)
        {
            throw new ConflictException(
                "El paciente de la venta no coincide con el paciente de la admisión.");
        }
    }

    private async Task EnsurePacienteExistsAsync(
        int pacienteId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Pacientes.AnyAsync(
            x => x.Id == pacienteId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Paciente), pacienteId);
    }

    private async Task EnsureMonedaExistsAsync(
        int monedaId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Monedas.AnyAsync(
            x => x.Id == monedaId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Moneda), monedaId);
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<VentaDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var servicioIds = detalles
            .Select(x => x.ServicioId)
            .Distinct()
            .ToList();

        var serviciosExistentes = await DbContext.Servicio
            .Where(x => servicioIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var servicioId in servicioIds.Except(serviciosExistentes))
        {
            throw new NotFoundException(nameof(Servicio), servicioId);
        }

        var medicoIds = detalles
            .Where(x => x.MedicoId.HasValue)
            .Select(x => x.MedicoId!.Value)
            .Distinct()
            .ToList();

        if (medicoIds.Count == 0)
            return;

        var medicosExistentes = await DbContext.Medicos
            .Where(x => medicoIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var medicoId in medicoIds.Except(medicosExistentes))
        {
            throw new NotFoundException(nameof(Medico), medicoId);
        }
    }

    private async Task ValidarPagadoresAsync(
        IReadOnlyCollection<VentaPagadorRequest> pagadores,
        CancellationToken cancellationToken)
    {
        var convenioIds = pagadores
            .Where(x => x.Tipo == TipoPagador.Convenio)
            .Select(x => x.ConvenioId)
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        if (convenioIds.Count == 0)
            return;

        var conveniosExistentes = await DbContext.Convenios
            .Where(x => convenioIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var convenioId in convenioIds.Except(conveniosExistentes))
        {
            throw new NotFoundException(nameof(Convenio), convenioId);
        }
    }

    private static VentaDetalleEntity CrearDetalle(
        VentaDetalleRequest request)
    {
        var total = VentaCalculos.TotalDetalle(request);
        var (montoMedico, montoClinica) = VentaCalculos.RepartoMedico(
            total,
            request.PorcentajeMedico);

        return new VentaDetalleEntity
        {
            ServicioId = request.ServicioId,
            MedicoId = request.MedicoId,
            Cantidad = request.Cantidad,
            PrecioUnitario = request.PrecioUnitario,
            Descuento = request.Descuento,
            Total = total,
            PorcentajeMedico = request.PorcentajeMedico,
            MontoMedico = montoMedico,
            MontoClinica = montoClinica
        };
    }

    private static VentaPagadorEntity CrearPagador(
        VentaPagadorRequest request)
    {
        return new VentaPagadorEntity
        {
            Tipo = request.Tipo,
            ConvenioId = request.Tipo == TipoPagador.Convenio
                ? request.ConvenioId
                : null,
            Monto = request.Monto,
            Estado = EstadoVentaPagador.Pendiente
        };
    }

    private static void ReemplazarDetalles(
        VentaEntity entity,
        IReadOnlyCollection<VentaDetalleRequest> detalles)
    {
        var existingByServicio = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(x => x.ServicioId);

        var incomingServicioIds = detalles
            .Select(x => x.ServicioId)
            .ToHashSet();

        foreach (var existing in entity.Detalles
                     .Where(x => x.Activo && !incomingServicioIds.Contains(x.ServicioId))
                     .ToList())
        {
            entity.Detalles.Remove(existing);
        }

        foreach (var request in detalles)
        {
            if (existingByServicio.TryGetValue(
                    request.ServicioId,
                    out var detalle))
            {
                detalle.MedicoId = request.MedicoId;
                detalle.Cantidad = request.Cantidad;
                detalle.PrecioUnitario = request.PrecioUnitario;
                detalle.Descuento = request.Descuento;
                detalle.PorcentajeMedico = request.PorcentajeMedico;

                var total = VentaCalculos.TotalDetalle(request);
                var (montoMedico, montoClinica) = VentaCalculos.RepartoMedico(
                    total,
                    request.PorcentajeMedico);

                detalle.Total = total;
                detalle.MontoMedico = montoMedico;
                detalle.MontoClinica = montoClinica;
            }
            else
            {
                entity.Detalles.Add(CrearDetalle(request));
            }
        }
    }

    private static void ReemplazarPagadores(
        VentaEntity entity,
        IReadOnlyCollection<VentaPagadorRequest> pagadores)
    {
        var existingActive = entity.Pagadores
            .Where(x => x.Activo)
            .ToList();

        var incomingKeys = pagadores
            .Select(x => new PagadorKey(x.Tipo, x.ConvenioId))
            .ToHashSet();

        foreach (var existing in existingActive
                     .Where(x => !incomingKeys.Contains(
                         new PagadorKey(x.Tipo, x.ConvenioId)))
                     .ToList())
        {
            entity.Pagadores.Remove(existing);
        }

        foreach (var request in pagadores)
        {
            var match = existingActive.FirstOrDefault(x =>
                x.Tipo == request.Tipo
                && x.ConvenioId == request.ConvenioId);

            if (match is not null)
            {
                match.Tipo = request.Tipo;
                match.ConvenioId = request.Tipo == TipoPagador.Convenio
                    ? request.ConvenioId
                    : null;
                match.Monto = request.Monto;
            }
            else
            {
                entity.Pagadores.Add(CrearPagador(request));
            }
        }
    }

    private static void CalcularTotales(
        VentaEntity entity)
    {
        var detallesActivos = entity.Detalles
            .Where(x => x.Activo)
            .ToList();

        entity.Subtotal = detallesActivos.Sum(x => x.Cantidad * x.PrecioUnitario);
        entity.Descuento = detallesActivos.Sum(x => x.Descuento);
        entity.Total = detallesActivos.Sum(x => x.Total);
    }

    private readonly struct PagadorKey(
        TipoPagador tipo,
        int? convenioId)
    {
        private readonly TipoPagador _tipo = tipo;
        private readonly int? _convenioId = convenioId;

        public bool Equals(PagadorKey other) =>
            _tipo == other._tipo
            && _convenioId == other._convenioId;

        public override int GetHashCode() =>
            HashCode.Combine(_tipo, _convenioId);
    }
}