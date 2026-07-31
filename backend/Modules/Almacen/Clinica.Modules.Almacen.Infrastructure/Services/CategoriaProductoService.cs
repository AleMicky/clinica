using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class CategoriaProductoService(AlmacenDbContext context) : ICategoriaProductoService
{
    public async Task<PagedResult<CategoriaProductoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        await context.CategoriasProducto.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);

    public async Task<CategoriaProductoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        await context.CategoriasProducto.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<CategoriaProductoResponse> CreateAsync(
        CreateCategoriaProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await context.CategoriasProducto.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<CategoriaProducto>(codigo, null),
            "El código ya existe.",
            cancellationToken);

        var entity = new CategoriaProducto
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion),
            CreatedAt = DateTime.UtcNow,
        };
        context.CategoriasProducto.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<CategoriaProductoResponse> UpdateAsync(
        Guid id,
        UpdateCategoriaProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.CategoriasProducto
            .GetRequiredAsync(id, "Categoría no encontrada.", cancellationToken);
        var codigo = StringNormalize.Required(request.Codigo);
        await context.CategoriasProducto.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<CategoriaProducto>(codigo, id),
            "El código ya existe.",
            cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.CategoriasProducto
            .GetRequiredAsync(id, "Categoría no encontrada.", cancellationToken);
        if (await context.Productos.AnyAsync(x => x.CategoriaProductoId == id, cancellationToken))
            throw new BusinessException("No se puede eliminar una categoría con productos asociados.");

        context.CategoriasProducto.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static CategoriaProductoResponse ToResponse(CategoriaProducto e) =>
        new(e.Id, e.Codigo, e.Nombre, e.Descripcion);
}
