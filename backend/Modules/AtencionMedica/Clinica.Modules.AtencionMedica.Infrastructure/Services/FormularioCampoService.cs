using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormularioCampos;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class FormularioCampoService(AtencionMedicaDbContext context)
    : IFormularioCampoService
{
    public Task<PagedResult<FormularioCampoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new FormularioCampoPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<FormularioCampoResponse>> GetPagedAsync(
        FormularioCampoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.FormularioCampos.AsNoTracking();

        if (request.FormularioSeccionId is { } formularioSeccionId && formularioSeccionId != Guid.Empty)
            query = query.Where(x => x.FormularioSeccionId == formularioSeccionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Etiqueta)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<FormularioCampoResponse>(items, total, page, pageSize);
    }

    public async Task<FormularioCampoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.FormularioCampos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FormularioCampoResponse> CreateAsync(
        CreateFormularioCampoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureFormularioSeccionExistsAsync(request.FormularioSeccionId, cancellationToken);
        await EnsureTipoCampoFormularioExistsAsync(request.TipoCampoFormularioId, cancellationToken);

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(
            request.FormularioSeccionId,
            codigo,
            null,
            cancellationToken);

        var entity = new FormularioCampo
        {
            FormularioSeccionId = request.FormularioSeccionId,
            Codigo = codigo,
            Etiqueta = Normalize(request.Etiqueta),
            TipoCampoFormularioId = request.TipoCampoFormularioId,
            EsRequerido = request.EsRequerido,
            Visible = request.Visible,
            Orden = request.Orden,
            Placeholder = NormalizeOptional(request.Placeholder),
            ValorDefecto = NormalizeOptional(request.ValorDefecto),
            OpcionesJson = NormalizeOptional(request.OpcionesJson),
            ValidacionesJson = NormalizeOptional(request.ValidacionesJson)
        };

        context.FormularioCampos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<FormularioCampoResponse> UpdateAsync(
        Guid id,
        UpdateFormularioCampoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FormularioCampos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Campo de formulario no encontrado.");

        await EnsureFormularioSeccionExistsAsync(request.FormularioSeccionId, cancellationToken);
        await EnsureTipoCampoFormularioExistsAsync(request.TipoCampoFormularioId, cancellationToken);

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(
            request.FormularioSeccionId,
            codigo,
            id,
            cancellationToken);

        entity.FormularioSeccionId = request.FormularioSeccionId;
        entity.Codigo = codigo;
        entity.Etiqueta = Normalize(request.Etiqueta);
        entity.TipoCampoFormularioId = request.TipoCampoFormularioId;
        entity.EsRequerido = request.EsRequerido;
        entity.Visible = request.Visible;
        entity.Orden = request.Orden;
        entity.Placeholder = NormalizeOptional(request.Placeholder);
        entity.ValorDefecto = NormalizeOptional(request.ValorDefecto);
        entity.OpcionesJson = NormalizeOptional(request.OpcionesJson);
        entity.ValidacionesJson = NormalizeOptional(request.ValidacionesJson);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.FormularioCampos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Campo de formulario no encontrado.");

        context.FormularioCampos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureFormularioSeccionExistsAsync(
        Guid formularioSeccionId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormularioSecciones
            .AnyAsync(x => x.Id == formularioSeccionId, cancellationToken);

        if (!exists)
            throw new BusinessException("La sección de formulario no existe.");
    }

    private async Task EnsureTipoCampoFormularioExistsAsync(
        Guid tipoCampoFormularioId,
        CancellationToken cancellationToken)
    {
        var exists = await context.TiposCampoFormulario
            .AnyAsync(x => x.Id == tipoCampoFormularioId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de campo de formulario no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        Guid formularioSeccionId,
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormularioCampos.AnyAsync(
            x => x.FormularioSeccionId == formularioSeccionId &&
                 x.Codigo == codigo &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe en esta sección.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static FormularioCampoResponse ToResponse(FormularioCampo entity) =>
        new(
            entity.Id,
            entity.FormularioSeccionId,
            entity.Codigo,
            entity.Etiqueta,
            entity.TipoCampoFormularioId,
            entity.EsRequerido,
            entity.Visible,
            entity.Orden,
            entity.Placeholder,
            entity.ValorDefecto,
            entity.OpcionesJson,
            entity.ValidacionesJson);
}
