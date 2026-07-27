using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Productos;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class ProductoService(AlmacenDbContext context) : IProductoService
{
    public async Task<PagedResult<ProductoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Productos
            .AsNoTracking()
            .Include(x => x.Categoria)
            .AsQueryable();

        return await query
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<ProductoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Productos
            .AsNoTracking()
            .Include(x => x.Categoria)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductoResponse> CreateAsync(
        CreateProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);
        await EnsureCategoriaExistsAsync(request.CategoriaId, cancellationToken);

        var entity = new Producto
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            CategoriaId = request.CategoriaId,
            UnidadMedidaId = request.UnidadMedidaId,
            StockMinimo = request.StockMinimo,
            ControlaLote = request.ControlaLote,
            ControlaVencimiento = request.ControlaVencimiento,
            EsMedicamento = request.EsMedicamento,
            Activo = request.Activo,
            CreatedAt = DateTime.UtcNow,
        };

        context.Productos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        await context.Entry(entity).Reference(x => x.Categoria).LoadAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<ProductoResponse> UpdateAsync(
        Guid id,
        UpdateProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Productos
            .Include(x => x.Categoria)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);
        await EnsureCategoriaExistsAsync(request.CategoriaId, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.CategoriaId = request.CategoriaId;
        entity.UnidadMedidaId = request.UnidadMedidaId;
        entity.StockMinimo = request.StockMinimo;
        entity.ControlaLote = request.ControlaLote;
        entity.ControlaVencimiento = request.ControlaVencimiento;
        entity.EsMedicamento = request.EsMedicamento;
        entity.Activo = request.Activo;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(entity).Reference(x => x.Categoria).LoadAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Productos
            .GetRequiredAsync(id, "Producto no encontrado.", cancellationToken);

        var hasStock = await context.Existencias.AnyAsync(
            x => x.ProductoId == id && x.Cantidad > 0,
            cancellationToken);

        if (hasStock)
            throw new BusinessException("No se puede eliminar un producto con existencias.");

        context.Productos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await context.Productos.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<Producto>(codigo, currentId),
            "El código ya existe.",
            cancellationToken);
    }

    private async Task EnsureCategoriaExistsAsync(Guid categoriaId, CancellationToken cancellationToken)
    {
        var exists = await context.Categorias.AnyAsync(x => x.Id == categoriaId, cancellationToken);
        if (!exists)
            throw new NotFoundException("Categoría no encontrada.");
    }

    private static ProductoResponse ToResponse(Producto entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.CategoriaId,
            entity.Categoria?.Nombre ?? string.Empty,
            entity.UnidadMedidaId,
            entity.StockMinimo,
            entity.ControlaLote,
            entity.ControlaVencimiento,
            entity.EsMedicamento,
            entity.Activo);
}
