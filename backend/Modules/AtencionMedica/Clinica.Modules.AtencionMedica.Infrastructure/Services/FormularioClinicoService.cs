using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
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
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.FormulariosClinicos.AsNoTracking();

        if (request.TipoAtencionId is { } tipoAtencionId && tipoAtencionId != Guid.Empty)
            query = query.Where(x => x.TipoAtencionId == tipoAtencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombre)
            .ThenByDescending(x => x.Version)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<FormularioClinicoResponse>(items, total, page, pageSize);
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

        var codigo = Normalize(request.Codigo);
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
            Nombre = Normalize(request.Nombre),
            Descripcion = NormalizeOptional(request.Descripcion),
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

        var codigo = Normalize(request.Codigo);
        await EnsureVersionIsUniqueAsync(
            request.TipoAtencionId,
            codigo,
            request.Version,
            id,
            cancellationToken);

        entity.TipoAtencionId = request.TipoAtencionId;
        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Descripcion = NormalizeOptional(request.Descripcion);
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

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
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
