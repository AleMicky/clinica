using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Pacientes;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Services;

public sealed class PacienteService(
    PersonasDbContext context
) : IPacienteService
{
    public Task<PagedResult<PacienteResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new PacientePagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<PacienteResponse>> GetPagedAsync(
        PacientePagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Pacientes
            .AsNoTracking()
            .Include(x => x.Persona)
            .Include(x => x.GrupoSanguineo)
            .AsQueryable();

        if (request.PersonaId is { } personaId && personaId != Guid.Empty)
            query = query.Where(x => x.PersonaId == personaId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.NumeroHistoriaClinica.Contains(search) ||
                x.Persona.Nombres.Contains(search) ||
                x.Persona.ApellidoPaterno.Contains(search) ||
                x.Persona.ApellidoMaterno.Contains(search) ||
                x.Persona.NumeroDocumento.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaRegistro)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<PacienteResponse>(items, total, page, pageSize);
    }

    public async Task<PacienteResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Pacientes
            .AsNoTracking()
            .Include(x => x.Persona)
            .Include(x => x.GrupoSanguineo)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PacienteResponse> CreateAsync(
        CreatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);
        await EnsurePersonaNotPacienteAsync(request.PersonaId, null, cancellationToken);

        if (request.GrupoSanguineoId is { } grupoSanguineoId)
            await EnsureCatalogoItemExistsAsync(grupoSanguineoId, cancellationToken);

        var numeroHistoria = Normalize(request.NumeroHistoriaClinica);
        await EnsureHistoriaClinicaIsUniqueAsync(numeroHistoria, null, cancellationToken);

        var entity = new Paciente
        {
            PersonaId = request.PersonaId,
            NumeroHistoriaClinica = numeroHistoria,
            GrupoSanguineoId = request.GrupoSanguineoId,
            Alergias = NormalizeOptional(request.Alergias),
            Observaciones = NormalizeOptional(request.Observaciones),
            FechaRegistro = DateTime.UtcNow
        };

        context.Pacientes.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<PacienteResponse> UpdateAsync(
        Guid id,
        UpdatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pacientes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Paciente no encontrado.");

        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);
        await EnsurePersonaNotPacienteAsync(request.PersonaId, id, cancellationToken);

        if (request.GrupoSanguineoId is { } grupoSanguineoId)
            await EnsureCatalogoItemExistsAsync(grupoSanguineoId, cancellationToken);

        var numeroHistoria = Normalize(request.NumeroHistoriaClinica);
        await EnsureHistoriaClinicaIsUniqueAsync(numeroHistoria, id, cancellationToken);

        entity.PersonaId = request.PersonaId;
        entity.NumeroHistoriaClinica = numeroHistoria;
        entity.GrupoSanguineoId = request.GrupoSanguineoId;
        entity.Alergias = NormalizeOptional(request.Alergias);
        entity.Observaciones = NormalizeOptional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pacientes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Paciente no encontrado.");

        context.Pacientes.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePersonaExistsAsync(
        Guid personaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Personas
            .AnyAsync(x => x.Id == personaId, cancellationToken);

        if (!exists)
            throw new BusinessException("La persona no existe.");
    }

    private async Task EnsurePersonaNotPacienteAsync(
        Guid personaId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Pacientes
            .AnyAsync(x =>
                    x.PersonaId == personaId &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("La persona ya está registrada como paciente.");
    }

    private async Task EnsureCatalogoItemExistsAsync(
        Guid catalogoItemId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<CatalogoItem>()
            .AnyAsync(x => x.Id == catalogoItemId, cancellationToken);

        if (!exists)
            throw new BusinessException("El ítem de catálogo no existe.");
    }

    private async Task EnsureHistoriaClinicaIsUniqueAsync(
        string numeroHistoriaClinica,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Pacientes
            .AnyAsync(x =>
                    x.NumeroHistoriaClinica == numeroHistoriaClinica &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El número de historia clínica ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static PacienteResponse ToResponse(Paciente entity)
    {
        return new PacienteResponse(
            entity.Id,
            entity.PersonaId,
            PersonaNaming.NombreCompleto(entity.Persona),
            entity.NumeroHistoriaClinica,
            entity.GrupoSanguineoId,
            entity.GrupoSanguineo?.Nombre,
            entity.Alergias,
            entity.Observaciones,
            entity.FechaRegistro);
    }
}
