using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.ContactosEmergencia;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
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

        return await query
            .OrderBy(x => x.Nombres)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
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
            Nombres = StringNormalize.Required(request.Nombres),
            Apellidos = StringNormalize.Optional(request.Apellidos),
            ParentescoId = request.ParentescoId,
            Telefono = StringNormalize.Optional(request.Telefono),
            Celular = StringNormalize.Optional(request.Celular),
            Direccion = StringNormalize.Optional(request.Direccion)
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
        entity.Nombres = StringNormalize.Required(request.Nombres);
        entity.Apellidos = StringNormalize.Optional(request.Apellidos);
        entity.ParentescoId = request.ParentescoId;
        entity.Telefono = StringNormalize.Optional(request.Telefono);
        entity.Celular = StringNormalize.Optional(request.Celular);
        entity.Direccion = StringNormalize.Optional(request.Direccion);

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
