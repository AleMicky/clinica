using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Mappers;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;
using AdmisionDetalleEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.AdmisionDetalle;

namespace Clinica.Api.Modules.Recepcion.Admision.Services;

public sealed class AdmisionService(
    AppDbContext dbContext,
    CorrelativoService correlativoService
)
{
    private DbSet<AdmisionEntity> Admisiones => dbContext.Set<AdmisionEntity>();

    public async Task<PagedResult<AdmisionResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = Admisiones
            .AsNoTracking()
            .Include(x => x.Detalles)
            .Where(x => x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Numero.Contains(normalizedSearch) ||
                (x.Observacion != null && x.Observacion.Contains(normalizedSearch)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderByDescending(x => x.FechaHora)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        var items = entities
            .Select(MapToResponse)
            .ToList();

        return new PagedResult<AdmisionResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<AdmisionResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
            .AsNoTracking()
            .Include(x => x.Detalles)
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionEntity), id);

        return MapToResponse(entity);
    }

    public async Task<AdmisionResponse> CrearAsync(
        CreateAdmisionRequest request,
        CancellationToken cancellationToken = default)
    {
       // await ValidarUnicidadNumeroAsync(request.Numero, cancellationToken);
        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureConvenioExistsAsync(request.ConvenioId, cancellationToken);
        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = AdmisionMapper.ToEntity(request);

        Normalizar(entity, request.Observacion);

        var paramCorrelativo = new GenerarCorrelativoRequest
        {
            Codigo = "ADM",
            Gestion = entity.FechaHora.Year,
            Prefijo = "ADM",
            Longitud = 6
        };
        
        var correlativo = await correlativoService.GenerarAsync(paramCorrelativo, cancellationToken);
        
        entity.Numero = correlativo.NumeroFormateado;
        entity.Estado = EstadoAdmision.Registrada;
        entity.Detalles = request.Detalles.Select(CrearDetalle).ToList();

        await Admisiones.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<AdmisionResponse> ActualizarAsync(
        int id,
        UpdateAdmisionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionEntity), id);

        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureConvenioExistsAsync(request.ConvenioId, cancellationToken);
        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        AdmisionMapper.UpdateEntity(request, entity);

        Normalizar(entity, request.Observacion);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionEntity), id);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdmisionResponse> CambiarEstadoAsync(
        int id,
        CambiarEstadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionEntity), id);

        if (!AdmisionTransiciones.EsValida(entity.Estado, request.EstadoDestino))
        {
            throw new ConflictException(
                $"No se puede transitar de {entity.Estado} a {request.EstadoDestino}.");
        }

        entity.Estado = request.EstadoDestino;

        if (!string.IsNullOrWhiteSpace(request.Motivo))
        {
            entity.Observacion = string.IsNullOrWhiteSpace(entity.Observacion)
                ? request.Motivo.Trim()
                : $"{entity.Observacion.Trim()} | {request.Motivo.Trim()}";
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    private static AdmisionResponse MapToResponse(AdmisionEntity entity)
    {
        return AdmisionMapper.ToResponse(entity) with
        {
            Detalles = AdmisionDetalleMapper.ToResponse(entity.Detalles)
        };
    }

    private async Task ValidarUnicidadNumeroAsync(
        string numero,
        CancellationToken cancellationToken)
    {
        var normalized = numero.TrimUpperRequired();

        var existe = await Admisiones.AnyAsync(
            x => x.Numero == normalized,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException($"Ya existe una admisión con el número '{normalized}'.");
        }
    }

    private async Task ValidarUnicidadNumeroAsync(
        string numero,
        int excludeId,
        CancellationToken cancellationToken)
    {
        var normalized = numero.TrimUpperRequired();

        var existe = await Admisiones.AnyAsync(
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
        var existe = await dbContext.Pacientes.AnyAsync(
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

        var existe = await dbContext.Convenios.AnyAsync(
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

        var serviciosExistentes = await dbContext.Servicio
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

        var medicosExistentes = await dbContext.Medicos
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
            Total = request.CalcularTotal()
        };
    }

    private static void ReemplazarDetalles(
        AdmisionEntity entity,
        IReadOnlyCollection<AdmisionDetalleRequest> detalles)
    {
        var existingByServicio = entity.Detalles
            .ToDictionary(x => x.ServicioId);

        var incomingServicioIds = detalles
            .Select(x => x.ServicioId)
            .ToHashSet();

        foreach (var existing in entity.Detalles
                     .Where(x => !incomingServicioIds.Contains(x.ServicioId))
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
                detalle.Total = request.CalcularTotal();
            }
            else
            {
                entity.Detalles.Add(CrearDetalle(request));
            }
        }
    }

    private static void Normalizar(
        AdmisionEntity entity,
        string? observacion)
    {
        entity.Observacion = observacion.TrimOrNull();
    }
}