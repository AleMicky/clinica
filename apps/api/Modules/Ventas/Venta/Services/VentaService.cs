using Clinica.Api.Data;
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

public sealed class VentaService(AppDbContext dbContext)
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
            Detalles = VentaDetalleMapper.ToResponse(entity.Detalles),
            Pagadores = VentaPagadorMapper.ToResponse(entity.Pagadores)
        };
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

        await ValidateUpdateAsync(
            id,
            request,
            entity,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<VentaEntity> ApplyOrder(
        IQueryable<VentaEntity> query)
    {
        return query
            .OrderByDescending(x => x.Fecha)
            .ThenBy(x => x.Id);
    }

    protected override VentaEntity MapToNewEntity(
        CreateVentaRequest request)
    {
        var entity = VentaMapper.ToEntity(request);

        Normalizar(entity, request.Numero);

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

        Normalizar(entity, request.Numero);

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
        await ValidarUnicidadNumeroAsync(
            request.Numero,
            cancellationToken);

        await EnsureAdmisionExistsAsync(
            request.AdmisionId,
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
        await ValidarUnicidadNumeroAsync(
            request.Numero,
            id,
            cancellationToken);

        await EnsureAdmisionExistsAsync(
            request.AdmisionId,
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

    private async Task ValidarUnicidadNumeroAsync(
        string numero,
        CancellationToken cancellationToken)
    {
        var normalized = NormalizarNumero(numero);

        var existe = await Entities.AnyAsync(
            x => x.Numero == normalized,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una venta con el número '{normalized}'.");
        }
    }

    private async Task ValidarUnicidadNumeroAsync(
        string numero,
        int excludeId,
        CancellationToken cancellationToken)
    {
        var normalized = NormalizarNumero(numero);

        var existe = await Entities.AnyAsync(
            x => x.Id != excludeId &&
                 x.Numero == normalized,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otra venta con el número '{normalized}'.");
        }
    }

    private async Task EnsureAdmisionExistsAsync(
        int admisionId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Admisiones.AnyAsync(
            x => x.Id == admisionId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Admision), admisionId);
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
        foreach (var detalle in entity.Detalles.ToList())
        {
            entity.Detalles.Remove(detalle);
        }

        foreach (var request in detalles)
        {
            entity.Detalles.Add(CrearDetalle(request));
        }
    }

    private static void ReemplazarPagadores(
        VentaEntity entity,
        IReadOnlyCollection<VentaPagadorRequest> pagadores)
    {
        foreach (var pagador in entity.Pagadores.ToList())
        {
            entity.Pagadores.Remove(pagador);
        }

        foreach (var request in pagadores)
        {
            entity.Pagadores.Add(CrearPagador(request));
        }
    }

    private static void CalcularTotales(
        VentaEntity entity)
    {
        entity.Subtotal = entity.Detalles.Sum(x => x.Cantidad * x.PrecioUnitario);
        entity.Descuento = entity.Detalles.Sum(x => x.Descuento);
        entity.Total = entity.Detalles.Sum(x => x.Total);
    }

    private static void Normalizar(
        VentaEntity entity,
        string numero)
    {
        entity.Numero = NormalizarNumero(numero);
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }
}
