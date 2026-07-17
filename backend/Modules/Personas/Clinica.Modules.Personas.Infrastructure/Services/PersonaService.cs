using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Personas;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Services;

public sealed class PersonaService(
    PersonasDbContext context
) : IPersonaService
{
    public Task<PagedResult<PersonaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new PersonaPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<PersonaResponse>> GetPagedAsync(
        PersonaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Personas
            .AsNoTracking()
            .Include(x => x.TipoDocumento)
            .Include(x => x.ExtensionDocumento)
            .Include(x => x.Sexo)
            .Include(x => x.EstadoCivil)
            .AsQueryable();

        if (request.TipoDocumentoId is { } tipoDocumentoId && tipoDocumentoId != Guid.Empty)
            query = query.Where(x => x.TipoDocumentoId == tipoDocumentoId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.NumeroDocumento.Contains(search) ||
                x.Nombres.Contains(search) ||
                x.ApellidoPaterno.Contains(search) ||
                x.ApellidoMaterno.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.ApellidoPaterno)
            .ThenBy(x => x.ApellidoMaterno)
            .ThenBy(x => x.Nombres)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<PersonaResponse>(items, total, page, pageSize);
    }

    public async Task<PersonaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Personas
            .AsNoTracking()
            .Include(x => x.TipoDocumento)
            .Include(x => x.ExtensionDocumento)
            .Include(x => x.Sexo)
            .Include(x => x.EstadoCivil)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, PersonaResponse>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();

        if (idList.Count == 0)
            return new Dictionary<Guid, PersonaResponse>();

        var items = await context.Personas
            .AsNoTracking()
            .Include(x => x.TipoDocumento)
            .Include(x => x.ExtensionDocumento)
            .Include(x => x.Sexo)
            .Include(x => x.EstadoCivil)
            .Where(x => idList.Contains(x.Id))
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return items.ToDictionary(x => x.Id);
    }

    public async Task<PersonaResponse> CreateAsync(
        CreatePersonaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCatalogoItemExistsAsync(request.TipoDocumentoId, cancellationToken);

        if (request.ExtensionDocumentoId is { } extensionId)
            await EnsureCatalogoItemExistsAsync(extensionId, cancellationToken);

        await EnsureCatalogoItemExistsAsync(request.SexoId, cancellationToken);
        await EnsureCatalogoItemExistsAsync(request.EstadoCivilId, cancellationToken);

        var numeroDocumento = Normalize(request.NumeroDocumento);
        await EnsureDocumentoIsUniqueAsync(
            request.TipoDocumentoId,
            numeroDocumento,
            null,
            cancellationToken);

        var entity = new Persona
        {
            TipoDocumentoId = request.TipoDocumentoId,
            NumeroDocumento = numeroDocumento,
            ExtensionDocumentoId = request.ExtensionDocumentoId,
            ComplementoDocumento = NormalizeOptional(request.ComplementoDocumento),
            Nombres = Normalize(request.Nombres),
            ApellidoPaterno = Normalize(request.ApellidoPaterno),
            ApellidoMaterno = Normalize(request.ApellidoMaterno),
            FechaNacimiento = request.FechaNacimiento,
            SexoId = request.SexoId,
            EstadoCivilId = request.EstadoCivilId,
            Telefono = Normalize(request.Telefono),
            Direccion = Normalize(request.Direccion)
        };

        context.Personas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<PersonaResponse> UpdateAsync(
        Guid id,
        UpdatePersonaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Personas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Persona no encontrada.");

        await EnsureCatalogoItemExistsAsync(request.TipoDocumentoId, cancellationToken);

        if (request.ExtensionDocumentoId is { } extensionId)
            await EnsureCatalogoItemExistsAsync(extensionId, cancellationToken);

        await EnsureCatalogoItemExistsAsync(request.SexoId, cancellationToken);
        await EnsureCatalogoItemExistsAsync(request.EstadoCivilId, cancellationToken);

        var numeroDocumento = Normalize(request.NumeroDocumento);
        await EnsureDocumentoIsUniqueAsync(
            request.TipoDocumentoId,
            numeroDocumento,
            id,
            cancellationToken);

        entity.TipoDocumentoId = request.TipoDocumentoId;
        entity.NumeroDocumento = numeroDocumento;
        entity.ExtensionDocumentoId = request.ExtensionDocumentoId;
        entity.ComplementoDocumento = NormalizeOptional(request.ComplementoDocumento);
        entity.Nombres = Normalize(request.Nombres);
        entity.ApellidoPaterno = Normalize(request.ApellidoPaterno);
        entity.ApellidoMaterno = Normalize(request.ApellidoMaterno);
        entity.FechaNacimiento = request.FechaNacimiento;
        entity.SexoId = request.SexoId;
        entity.EstadoCivilId = request.EstadoCivilId;
        entity.Telefono = Normalize(request.Telefono);
        entity.Direccion = Normalize(request.Direccion);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Personas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Persona no encontrada.");

        context.Personas.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
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

    private async Task EnsureDocumentoIsUniqueAsync(
        Guid tipoDocumentoId,
        string numeroDocumento,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Personas
            .AnyAsync(x =>
                    x.TipoDocumentoId == tipoDocumentoId &&
                    x.NumeroDocumento == numeroDocumento &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El documento ya está registrado.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static PersonaResponse ToResponse(Persona entity)
    {
        return new PersonaResponse(
            entity.Id,
            entity.TipoDocumentoId,
            entity.TipoDocumento.Nombre,
            entity.NumeroDocumento,
            entity.ExtensionDocumentoId,
            entity.ExtensionDocumento?.Nombre,
            entity.ComplementoDocumento,
            entity.Nombres,
            entity.ApellidoPaterno,
            entity.ApellidoMaterno,
            PersonaNaming.NombreCompleto(entity),
            entity.FechaNacimiento,
            entity.SexoId,
            entity.Sexo.Nombre,
            entity.EstadoCivilId,
            entity.EstadoCivil.Nombre,
            entity.Telefono,
            entity.Direccion);
    }
}
