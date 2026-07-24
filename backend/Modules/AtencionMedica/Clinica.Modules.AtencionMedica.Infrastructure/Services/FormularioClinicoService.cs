using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class FormularioClinicoService(AtencionMedicaDbContext context)
    : IFormularioClinicoService
{
    public Task<PagedResult<FormularioClinicoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new FormularioClinicoPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<FormularioClinicoResponse>> GetPagedAsync(
        FormularioClinicoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.FormulariosClinicos.AsNoTracking();

        if (request.TipoAtencionId is { } tipoAtencionId && tipoAtencionId != Guid.Empty)
            query = query.Where(x => x.TipoAtencionId == tipoAtencionId);

        return await query
            .OrderBy(x => x.Nombre)
            .ThenByDescending(x => x.Version)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<FormularioClinicoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.FormulariosClinicos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FormularioClinicoResponse> CreateAsync(
        CreateFormularioClinicoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureVersionIsUniqueAsync(
            request.TipoAtencionId,
            codigo,
            request.Version,
            null,
            cancellationToken);

        var entity = new FormularioClinico
        {
            TipoAtencionId = request.TipoAtencionId,
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion),
            Version = request.Version,
            Activo = request.Activo
        };

        context.FormulariosClinicos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<FormularioClinicoResponse> UpdateAsync(
        Guid id,
        UpdateFormularioClinicoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FormulariosClinicos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Formulario clínico no encontrado.");

        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureVersionIsUniqueAsync(
            request.TipoAtencionId,
            codigo,
            request.Version,
            id,
            cancellationToken);

        entity.TipoAtencionId = request.TipoAtencionId;
        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.Version = request.Version;
        entity.Activo = request.Activo;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.FormulariosClinicos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Formulario clínico no encontrado.");

        context.FormulariosClinicos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureTipoAtencionExistsAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        var exists = await context.TiposAtencion
            .AnyAsync(x => x.Id == tipoAtencionId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de atención no existe.");
    }

    private async Task EnsureVersionIsUniqueAsync(
        Guid tipoAtencionId,
        string codigo,
        int version,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormulariosClinicos.AnyAsync(
            x => x.TipoAtencionId == tipoAtencionId &&
                 x.Codigo == codigo &&
                 x.Version == version &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("Ya existe un formulario con el mismo código y versión.");
    }

    private static FormularioClinicoResponse ToResponse(FormularioClinico entity) =>
        new(
            entity.Id,
            entity.TipoAtencionId,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty,
            entity.Version,
            entity.Activo);
}
