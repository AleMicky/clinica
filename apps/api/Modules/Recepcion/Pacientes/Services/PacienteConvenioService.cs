using Clinica.Api.Data;
using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Mappers;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using PacienteConvenioEntity = Clinica.Api.Modules.Recepcion.Pacientes.Entity.PacienteConvenio;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Services;

public sealed class PacienteConvenioService(AppDbContext dbContext)
{
    public async Task<PagedResult<PacienteConvenioResponse>> ListarAsync(
        int pacienteId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(pacienteId, cancellationToken);

        var query = dbContext.PacientesConvenios
            .AsNoTracking()
            .Include(x => x.Convenio)
            .Where(x => x.PacienteId == pacienteId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Convenio.Codigo.Contains(normalizedSearch) ||
                x.Convenio.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var entities = await query
            .OrderByDescending(x => x.EsPrincipal)
            .ThenBy(x => x.Convenio.Nombre)
            .ThenBy(x => x.Id)
            .Skip((pagination.ValidPage - 1) * pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<PacienteConvenioResponse>(
            entities.Select(MapToResponse).ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<PacienteConvenioResponse> ObtenerAsync(
        int pacienteId,
        int id,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(pacienteId, cancellationToken);

        var entity = await dbContext.PacientesConvenios
            .AsNoTracking()
            .Include(x => x.Convenio)
            .FirstOrDefaultAsync(
                x => x.PacienteId == pacienteId
                     && x.Id == id
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("PacienteConvenio", id);

        return MapToResponse(entity);
    }

    public async Task<PacienteConvenioResponse> CrearAsync(
        int pacienteId,
        CreatePacienteConvenioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(pacienteId, cancellationToken);
        await EnsureConvenioExistsAsync(request.ConvenioId, cancellationToken);

        var existe = await dbContext.PacientesConvenios.AnyAsync(
            x => x.PacienteId == pacienteId
                 && x.ConvenioId == request.ConvenioId,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El paciente ya tiene asignado ese convenio.");
        }

        var entity = PacienteConvenioMapper.ToEntity(request);
        entity.PacienteId = pacienteId;
        entity.ConvenioId = request.ConvenioId;
        entity.NumeroAfiliado = request.NumeroAfiliado.TrimOrNull();
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.EsPrincipal = request.EsPrincipal;
        entity.Activo = true;

        if (entity.EsPrincipal)
        {
            await DesmarcarOtrosPrincipalesAsync(
                pacienteId,
                cancellationToken);
        }

        await dbContext.PacientesConvenios.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        await LoadConvenioAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<PacienteConvenioResponse> ActualizarAsync(
        int pacienteId,
        int id,
        UpdatePacienteConvenioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(pacienteId, cancellationToken);

        var entity = await dbContext.PacientesConvenios
            .Include(x => x.Convenio)
            .FirstOrDefaultAsync(
                x => x.PacienteId == pacienteId
                     && x.Id == id
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("PacienteConvenio", id);

        await EnsureConvenioExistsAsync(request.ConvenioId, cancellationToken);

        var existe = await dbContext.PacientesConvenios.AnyAsync(
            x => x.PacienteId == pacienteId
                 && x.Id != id
                 && x.ConvenioId == request.ConvenioId,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El paciente ya tiene asignado ese convenio.");
        }

        PacienteConvenioMapper.UpdateEntity(request, entity);
        entity.ConvenioId = request.ConvenioId;
        entity.NumeroAfiliado = request.NumeroAfiliado.TrimOrNull();
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.EsPrincipal = request.EsPrincipal;

        if (entity.EsPrincipal)
        {
            await DesmarcarOtrosPrincipalesAsync(
                pacienteId,
                id,
                cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public async Task EliminarAsync(
        int pacienteId,
        int id,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(pacienteId, cancellationToken);

        var entity = await dbContext.PacientesConvenios
            .FirstOrDefaultAsync(
                x => x.PacienteId == pacienteId
                     && x.Id == id
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("PacienteConvenio", id);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePacienteExistsAsync(
        int pacienteId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Pacientes.AnyAsync(
            x => x.Id == pacienteId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException("Paciente", pacienteId);
    }

    private async Task EnsureConvenioExistsAsync(
        int convenioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Convenios.AnyAsync(
            x => x.Id == convenioId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Convenio), convenioId);
    }

    private Task DesmarcarOtrosPrincipalesAsync(
        int pacienteId,
        CancellationToken cancellationToken)
    {
        return dbContext.PacientesConvenios
            .Where(x => x.PacienteId == pacienteId && x.EsPrincipal)
            .ExecuteUpdateAsync(
                s => s.SetProperty(x => x.EsPrincipal, false),
                cancellationToken);
    }

    private Task DesmarcarOtrosPrincipalesAsync(
        int pacienteId,
        int excludeId,
        CancellationToken cancellationToken)
    {
        return dbContext.PacientesConvenios
            .Where(x => x.PacienteId == pacienteId
                        && x.Id != excludeId
                        && x.EsPrincipal)
            .ExecuteUpdateAsync(
                s => s.SetProperty(x => x.EsPrincipal, false),
                cancellationToken);
    }

    private async Task LoadConvenioAsync(
        PacienteConvenioEntity entity,
        CancellationToken cancellationToken)
    {
        if (entity.Convenio is null)
        {
            await dbContext.Entry(entity)
                .Reference(x => x.Convenio)
                .LoadAsync(cancellationToken);
        }
    }

    private static PacienteConvenioResponse MapToResponse(
        PacienteConvenioEntity entity)
    {
        return new PacienteConvenioResponse
        {
            Id = entity.Id,
            PacienteId = entity.PacienteId,
            ConvenioId = entity.ConvenioId,
            Convenio = MapConvenioInfo(entity.Convenio),
            NumeroAfiliado = entity.NumeroAfiliado,
            FechaInicio = entity.FechaInicio,
            FechaFin = entity.FechaFin,
            EsPrincipal = entity.EsPrincipal,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static ConvenioInfo? MapConvenioInfo(Convenio? convenio)
    {
        if (convenio is null)
            return null;

        return new ConvenioInfo
        {
            Id = convenio.Id,
            Codigo = convenio.Codigo,
            Nombre = convenio.Nombre
        };
    }
}
