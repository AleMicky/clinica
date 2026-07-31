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
        var items = await context.Productos
            .AsNoTracking()
            .Include(x => x.CategoriaProducto)
            .Include(x => x.UnidadMedida)
            .Include(x => x.MedicamentoDetalle)
            .OrderBy(x => x.Nombre)
            .ToPagedResultAsync(request, cancellationToken);

        return new PagedResult<ProductoResponse>(
            items.Items.Select(ToResponse).ToList(),
            items.TotalRecords,
            items.Page,
            items.PageSize);
    }

    public async Task<ProductoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Productos
            .AsNoTracking()
            .Include(x => x.CategoriaProducto)
            .Include(x => x.UnidadMedida)
            .Include(x => x.MedicamentoDetalle)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? null : ToResponse(entity);
    }

    public async Task<ProductoResponse> CreateAsync(
        CreateProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);
        await EnsureCategoriaExistsAsync(request.CategoriaId, cancellationToken);
        await EnsureUnidadExistsAsync(request.UnidadMedidaId, cancellationToken);

        var entity = new Producto
        {
            Id = Guid.NewGuid(),
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion),
            CodigoBarras = StringNormalize.Optional(request.CodigoBarras),
            CategoriaProductoId = request.CategoriaId,
            UnidadMedidaId = request.UnidadMedidaId,
            StockMinimo = request.StockMinimo,
            StockMaximo = request.StockMaximo,
            ManejaLote = request.ControlaLote,
            ManejaVencimiento = request.ControlaVencimiento,
            ManejaSerie = request.ManejaSerie,
            EsMedicamento = request.EsMedicamento,
            Activo = request.Activo,
            CreatedAt = DateTime.UtcNow,
        };

        context.Productos.Add(entity);
        await SyncMedicamentoDetalleAsync(entity, request.EsMedicamento, request.Medicamento, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ProductoResponse> UpdateAsync(
        Guid id,
        UpdateProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Productos
            .Include(x => x.CategoriaProducto)
            .Include(x => x.UnidadMedida)
            .Include(x => x.MedicamentoDetalle)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);
        await EnsureCategoriaExistsAsync(request.CategoriaId, cancellationToken);
        await EnsureUnidadExistsAsync(request.UnidadMedidaId, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.CodigoBarras = StringNormalize.Optional(request.CodigoBarras);
        entity.CategoriaProductoId = request.CategoriaId;
        entity.UnidadMedidaId = request.UnidadMedidaId;
        entity.StockMinimo = request.StockMinimo;
        entity.StockMaximo = request.StockMaximo;
        entity.ManejaLote = request.ControlaLote;
        entity.ManejaVencimiento = request.ControlaVencimiento;
        entity.ManejaSerie = request.ManejaSerie;
        entity.EsMedicamento = request.EsMedicamento;
        entity.Activo = request.Activo;
        entity.UpdatedAt = DateTime.UtcNow;

        await SyncMedicamentoDetalleAsync(entity, request.EsMedicamento, request.Medicamento, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Productos
            .Include(x => x.MedicamentoDetalle)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var hasStock = await context.ProductosStock.AnyAsync(
            x => x.ProductoId == id && x.CantidadDisponible > 0,
            cancellationToken);

        if (hasStock)
            throw new BusinessException("No se puede eliminar un producto con existencias.");

        if (entity.MedicamentoDetalle is not null)
            context.MedicamentosDetalle.Remove(entity.MedicamentoDetalle);

        context.Productos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task SyncMedicamentoDetalleAsync(
        Producto entity,
        bool esMedicamento,
        MedicamentoDetalleDto? dto,
        CancellationToken cancellationToken)
    {
        if (!esMedicamento)
        {
            if (entity.MedicamentoDetalle is not null)
            {
                context.MedicamentosDetalle.Remove(entity.MedicamentoDetalle);
                entity.MedicamentoDetalle = null;
            }
            return;
        }

        if (dto?.FormaFarmaceuticaId is Guid formaId)
        {
            var exists = await context.FormasFarmaceuticas.AnyAsync(x => x.Id == formaId, cancellationToken);
            if (!exists)
                throw new NotFoundException("Forma farmacéutica no encontrada.");
        }

        if (entity.MedicamentoDetalle is null)
        {
            entity.MedicamentoDetalle = new MedicamentoDetalle
            {
                Id = Guid.NewGuid(),
                ProductoId = entity.Id,
                CreatedAt = DateTime.UtcNow,
            };
            context.MedicamentosDetalle.Add(entity.MedicamentoDetalle);
        }

        var med = entity.MedicamentoDetalle;
        med.NombreGenerico = StringNormalize.Optional(dto?.NombreGenerico);
        med.NombreComercial = StringNormalize.Optional(dto?.NombreComercial);
        med.Concentracion = StringNormalize.Optional(dto?.Concentracion);
        med.Presentacion = StringNormalize.Optional(dto?.Presentacion);
        med.FormaFarmaceuticaId = dto?.FormaFarmaceuticaId;
        med.RequiereReceta = dto?.RequiereReceta ?? false;
        med.EsControlado = dto?.EsControlado ?? false;
        med.UpdatedAt = DateTime.UtcNow;
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
        var exists = await context.CategoriasProducto.AnyAsync(x => x.Id == categoriaId, cancellationToken);
        if (!exists)
            throw new NotFoundException("Categoría no encontrada.");
    }

    private async Task EnsureUnidadExistsAsync(Guid unidadMedidaId, CancellationToken cancellationToken)
    {
        var exists = await context.UnidadesMedida.AnyAsync(x => x.Id == unidadMedidaId, cancellationToken);
        if (!exists)
            throw new NotFoundException("Unidad de medida no encontrada.");
    }

    private static ProductoResponse ToResponse(Producto entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion,
            entity.CodigoBarras,
            entity.CategoriaProductoId,
            entity.CategoriaProducto?.Nombre ?? string.Empty,
            entity.UnidadMedidaId,
            entity.UnidadMedida?.Nombre,
            entity.StockMinimo,
            entity.StockMaximo,
            entity.ManejaLote,
            entity.ManejaVencimiento,
            entity.ManejaSerie,
            entity.EsMedicamento,
            entity.Activo,
            entity.MedicamentoDetalle is null
                ? null
                : new MedicamentoDetalleDto(
                    entity.MedicamentoDetalle.NombreGenerico,
                    entity.MedicamentoDetalle.NombreComercial,
                    entity.MedicamentoDetalle.Concentracion,
                    entity.MedicamentoDetalle.Presentacion,
                    entity.MedicamentoDetalle.FormaFarmaceuticaId,
                    entity.MedicamentoDetalle.RequiereReceta,
                    entity.MedicamentoDetalle.EsControlado));
}
