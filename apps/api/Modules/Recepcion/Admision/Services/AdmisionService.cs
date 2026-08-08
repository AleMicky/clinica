using Clinica.Api.Data;
using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Mappers;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;
using AdmisionDetalleEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.AdmisionDetalle;

namespace Clinica.Api.Modules.Recepcion.Admision.Services;

public sealed class AdmisionService(AppDbContext dbContext)
    : CrudService<
        AdmisionEntity,
        CreateAdmisionRequest,
        UpdateAdmisionRequest,
        AdmisionResponse
    >(dbContext)
{
    public override async Task<AdmisionResponse> ActualizarAsync(
        int id,
        UpdateAdmisionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .Include(x => x.Detalles)
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

    protected override IQueryable<AdmisionEntity> ApplyOrder(
        IQueryable<AdmisionEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenBy(x => x.Id);
    }

    protected override AdmisionEntity MapToNewEntity(
        CreateAdmisionRequest request)
    {
        var entity = AdmisionMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Numero,
            request.Observacion);

        entity.Detalles = request.Detalles
            .Select(CrearDetalle)
            .ToList();

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateAdmisionRequest request,
        AdmisionEntity entity)
    {
        AdmisionMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Numero,
            request.Observacion);

        ReemplazarDetalles(entity, request.Detalles);
    }

    protected override AdmisionResponse MapToResponse(
        AdmisionEntity entity)
    {
        return AdmisionMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<AdmisionResponse> MapToResponseList(
        IEnumerable<AdmisionEntity> entities)
    {
        return AdmisionMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateAdmisionRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarUnicidadNumeroAsync(
            request.Numero,
            cancellationToken);

        await EnsurePacienteExistsAsync(
            request.PacienteId,
            cancellationToken);

        await EnsureConvenioExistsAsync(
            request.ConvenioId,
            cancellationToken);

        await ValidarDetallesAsync(
            request.Detalles,
            cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateAdmisionRequest request,
        AdmisionEntity entity,
        CancellationToken cancellationToken)
    {
        await ValidarUnicidadNumeroAsync(
            request.Numero,
            id,
            cancellationToken);

        await EnsurePacienteExistsAsync(
            request.PacienteId,
            cancellationToken);

        await EnsureConvenioExistsAsync(
            request.ConvenioId,
            cancellationToken);

        await ValidarDetallesAsync(
            request.Detalles,
            cancellationToken);
    }

    protected override IQueryable<AdmisionEntity> ApplySearch(
        IQueryable<AdmisionEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Numero.Contains(search) ||
            (x.Observacion != null && x.Observacion.Contains(search)));
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
                $"Ya existe una admisión con el número '{normalized}'.");
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
                $"Ya existe otra admisión con el número '{normalized}'.");
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

    private async Task EnsureConvenioExistsAsync(
        int? convenioId,
        CancellationToken cancellationToken)
    {
        if (convenioId is null)
            return;

        var existe = await DbContext.Convenios.AnyAsync(
            x => x.Id == convenioId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Convenio), convenioId.Value);
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<AdmisionDetalleRequest> detalles,
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

    private static AdmisionDetalleEntity CrearDetalle(
        AdmisionDetalleRequest request)
    {
        return new AdmisionDetalleEntity
        {
            ServicioId = request.ServicioId,
            MedicoId = request.MedicoId,
            Cantidad = request.Cantidad,
            PrecioUnitario = request.PrecioUnitario,
            Descuento = request.Descuento,
            Total = CalcularTotal(request)
        };
    }

    private static void ReemplazarDetalles(
        AdmisionEntity entity,
        IReadOnlyCollection<AdmisionDetalleRequest> detalles)
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

    private static decimal CalcularTotal(
        AdmisionDetalleRequest request)
    {
        return (request.Cantidad * request.PrecioUnitario)
               - request.Descuento;
    }

    private static void Normalizar(
        AdmisionEntity entity,
        string numero,
        string? observacion)
    {
        entity.Numero = NormalizarNumero(numero);
        entity.Observacion = Limpiar(observacion);
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
