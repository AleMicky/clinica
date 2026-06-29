using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormularioSecciones;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class FormularioSeccionService(AtencionMedicaDbContext context)
    : IFormularioSeccionService
{
    public Task<PagedResult<FormularioSeccionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new FormularioSeccionPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<FormularioSeccionResponse>> GetPagedAsync(
        FormularioSeccionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.FormularioSecciones.AsNoTracking();

        if (request.FormularioClinicoId is { } formularioClinicoId && formularioClinicoId != Guid.Empty)
            query = query.Where(x => x.FormularioClinicoId == formularioClinicoId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<FormularioSeccionResponse>(items, total, page, pageSize);
    }

    public async Task<FormularioSeccionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.FormularioSecciones
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<FormularioSeccionResponse> CreateAsync(
        CreateFormularioSeccionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureFormularioClinicoExistsAsync(request.FormularioClinicoId, cancellationToken);

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(
            request.FormularioClinicoId,
            codigo,
            null,
            cancellationToken);

        var entity = new FormularioSeccion
        {
            FormularioClinicoId = request.FormularioClinicoId,
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            Orden = request.Orden,
            EtapaFlujo = NormalizeOptional(request.EtapaFlujo)
        };

        context.FormularioSecciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<FormularioSeccionResponse> UpdateAsync(
        Guid id,
        UpdateFormularioSeccionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FormularioSecciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Sección de formulario no encontrada.");

        await EnsureFormularioClinicoExistsAsync(request.FormularioClinicoId, cancellationToken);

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(
            request.FormularioClinicoId,
            codigo,
            id,
            cancellationToken);

        entity.FormularioClinicoId = request.FormularioClinicoId;
        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Orden = request.Orden;
        entity.EtapaFlujo = NormalizeOptional(request.EtapaFlujo);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.FormularioSecciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Sección de formulario no encontrada.");

        context.FormularioSecciones.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureFormularioClinicoExistsAsync(
        Guid formularioClinicoId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormulariosClinicos
            .AnyAsync(x => x.Id == formularioClinicoId, cancellationToken);

        if (!exists)
            throw new BusinessException("El formulario clínico no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        Guid formularioClinicoId,
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.FormularioSecciones.AnyAsync(
            x => x.FormularioClinicoId == formularioClinicoId &&
                 x.Codigo == codigo &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe en este formulario.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static FormularioSeccionResponse ToResponse(FormularioSeccion entity) =>
        new(entity.Id, entity.FormularioClinicoId, entity.Codigo, entity.Nombre, entity.Orden, entity.EtapaFlujo);
}
