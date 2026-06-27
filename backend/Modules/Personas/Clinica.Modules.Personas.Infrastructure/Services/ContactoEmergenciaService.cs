using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.ContactosEmergencia;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Services;

public sealed class ContactoEmergenciaService(
    PersonasDbContext context
) : IContactoEmergenciaService
{
    public Task<PagedResult<ContactoEmergenciaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new ContactoEmergenciaPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<ContactoEmergenciaResponse>> GetPagedAsync(
        ContactoEmergenciaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.ContactosEmergencia
            .AsNoTracking()
            .Include(x => x.Parentesco)
            .AsQueryable();

        if (request.PersonaId is { } personaId && personaId != Guid.Empty)
            query = query.Where(x => x.PersonaId == personaId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Nombres.Contains(search) ||
                (x.Apellidos != null && x.Apellidos.Contains(search)) ||
                (x.Telefono != null && x.Telefono.Contains(search)) ||
                (x.Celular != null && x.Celular.Contains(search)));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombres)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<ContactoEmergenciaResponse>(items, total, page, pageSize);
    }

    public async Task<ContactoEmergenciaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.ContactosEmergencia
            .AsNoTracking()
            .Include(x => x.Parentesco)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ContactoEmergenciaResponse> CreateAsync(
        CreateContactoEmergenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);

        if (request.ParentescoId is { } parentescoId)
            await EnsureCatalogoItemExistsAsync(parentescoId, cancellationToken);

        var entity = new ContactoEmergencia
        {
            PersonaId = request.PersonaId,
            Nombres = Normalize(request.Nombres),
            Apellidos = NormalizeOptional(request.Apellidos),
            ParentescoId = request.ParentescoId,
            Telefono = NormalizeOptional(request.Telefono),
            Celular = NormalizeOptional(request.Celular),
            Direccion = NormalizeOptional(request.Direccion)
        };

        context.ContactosEmergencia.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ContactoEmergenciaResponse> UpdateAsync(
        Guid id,
        UpdateContactoEmergenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ContactosEmergencia
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Contacto de emergencia no encontrado.");

        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);

        if (request.ParentescoId is { } parentescoId)
            await EnsureCatalogoItemExistsAsync(parentescoId, cancellationToken);

        entity.PersonaId = request.PersonaId;
        entity.Nombres = Normalize(request.Nombres);
        entity.Apellidos = NormalizeOptional(request.Apellidos);
        entity.ParentescoId = request.ParentescoId;
        entity.Telefono = NormalizeOptional(request.Telefono);
        entity.Celular = NormalizeOptional(request.Celular);
        entity.Direccion = NormalizeOptional(request.Direccion);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ContactosEmergencia
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Contacto de emergencia no encontrado.");

        context.ContactosEmergencia.Remove(entity);
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

    private async Task EnsureCatalogoItemExistsAsync(
        Guid catalogoItemId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<CatalogoItem>()
            .AnyAsync(x => x.Id == catalogoItemId, cancellationToken);

        if (!exists)
            throw new BusinessException("El ítem de catálogo no existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static ContactoEmergenciaResponse ToResponse(ContactoEmergencia entity)
    {
        return new ContactoEmergenciaResponse(
            entity.Id,
            entity.PersonaId,
            entity.Nombres,
            entity.Apellidos,
            entity.ParentescoId,
            entity.Parentesco?.Nombre,
            entity.Telefono,
            entity.Celular,
            entity.Direccion);
    }
}
