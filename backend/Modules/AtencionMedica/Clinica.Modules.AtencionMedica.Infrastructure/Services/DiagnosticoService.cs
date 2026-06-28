using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Diagnosticos;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class DiagnosticoService(AtencionMedicaDbContext context) : IDiagnosticoService
{
    public Task<PagedResult<DiagnosticoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new DiagnosticoPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<DiagnosticoResponse>> GetPagedAsync(
        DiagnosticoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Diagnosticos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Busqueda))
        {
            var term = request.Busqueda.Trim();
            query = query.Where(x =>
                x.CodigoCie10.Contains(term) ||
                x.Nombre.Contains(term));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.CodigoCie10)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<DiagnosticoResponse>(items, total, page, pageSize);
    }

    public async Task<DiagnosticoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Diagnosticos.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<DiagnosticoResponse> CreateAsync(
        CreateDiagnosticoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = Normalize(request.CodigoCie10).ToUpperInvariant();
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Diagnostico
        {
            CodigoCie10 = codigo,
            Nombre = Normalize(request.Nombre),
            Descripcion = NormalizeOptional(request.Descripcion)
        };

        context.Diagnosticos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<DiagnosticoResponse> UpdateAsync(
        Guid id,
        UpdateDiagnosticoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Diagnosticos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Diagnóstico no encontrado.");

        var codigo = Normalize(request.CodigoCie10).ToUpperInvariant();
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.CodigoCie10 = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Descripcion = NormalizeOptional(request.Descripcion);

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Diagnosticos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Diagnóstico no encontrado.");

        context.Diagnosticos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(string codigo, Guid? currentId, CancellationToken cancellationToken)
    {
        var exists = await context.Diagnosticos.AnyAsync(
            x => x.CodigoCie10 == codigo && (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código CIE-10 ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static DiagnosticoResponse ToResponse(Diagnostico entity) =>
        new(entity.Id, entity.CodigoCie10, entity.Nombre, entity.Descripcion);
}
