using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Producto.Dtos;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Excel;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
using MarcaEntity = Clinica.Api.Modules.Almacenes.Marca.Entity.Marca;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using ProductoMapper = Clinica.Api.Modules.Almacenes.Producto.Mappers.ProductoMapper;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using UnidadesMedidaEntity = Clinica.Api.Modules.Parametros.UnidadesMedida.Entity.UnidadesMedida;

namespace Clinica.Api.Modules.Almacenes.Producto.Services;

public interface IProductoService
{
    Task<PagedResult<ProductoResponse>> ListarAsync(
        int? categoriaProductoId,
        int? marcaId,
        int? proveedorId,
        int? unidadMedidaId,
        string? categoriaUnidadMedida,
        bool? controlaLote,
        bool? controlaVencimiento,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<byte[]> ExportarExcelAsync(
        int? categoriaProductoId,
        int? marcaId,
        int? proveedorId,
        int? unidadMedidaId,
        string? categoriaUnidadMedida,
        bool? controlaLote,
        bool? controlaVencimiento,
        string? search,
        CancellationToken cancellationToken = default);

    Task<ProductoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ProductoResponse> CrearAsync(
        CreateProductoRequest request,
        CancellationToken cancellationToken = default);

    Task<ProductoResponse> ActualizarAsync(
        int id,
        UpdateProductoRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public sealed class ProductoService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    IExcelReportGenerator excelReportGenerator)
    : IProductoService
{
    public async Task<PagedResult<ProductoResponse>> ListarAsync(
        int? categoriaProductoId,
        int? marcaId,
        int? proveedorId,
        int? unidadMedidaId,
        string? categoriaUnidadMedida,
        bool? controlaLote,
        bool? controlaVencimiento,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .Productos
            .AsNoTracking()
            .Where(x => x.Activo);

        if (categoriaProductoId.HasValue)
        {
            query = query.Where(x => x.CategoriaProductoId == categoriaProductoId.Value);
        }

        if (marcaId.HasValue)
        {
            query = query.Where(x => x.MarcaId == marcaId.Value);
        }

        if (proveedorId.HasValue)
        {
            query = query.Where(x => x.ProveedorId == proveedorId.Value);
        }

        if (unidadMedidaId.HasValue)
        {
            query = query.Where(x => x.UnidadMedidaId == unidadMedidaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(categoriaUnidadMedida))
        {
            var catUm = categoriaUnidadMedida.Trim();
            query = query.Where(x => x.UnidadMedida.Categoria == catUm);
        }

        if (controlaLote.HasValue)
        {
            query = query.Where(x => x.ControlaLote == controlaLote.Value);
        }

        if (controlaVencimiento.HasValue)
        {
            query = query.Where(x => x.ControlaVencimiento == controlaVencimiento.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(termino) ||
                x.Nombre.Contains(termino) ||
                (x.Descripcion != null && x.Descripcion.Contains(termino)) ||
                (x.Marca != null && (x.Marca.Nombre.Contains(termino) || x.Marca.Codigo.Contains(termino))) ||
                (x.Proveedor != null && (x.Proveedor.RazonSocial.Contains(termino) || x.Proveedor.Codigo.Contains(termino))));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var productos = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.CategoriaProducto)
            .Include(x => x.Marca)
            .Include(x => x.UnidadMedida)
            .Include(x => x.Proveedor)
            .ToListAsync(cancellationToken);

        var items = productos
            .Select(x => Mapear(
                x,
                x.CategoriaProducto?.Nombre,
                x.Marca?.Nombre,
                x.Marca?.Codigo,
                x.UnidadMedida?.Nombre,
                x.UnidadMedida?.Simbolo,
                x.UnidadMedida?.Categoria,
                x.Proveedor?.RazonSocial,
                x.Proveedor?.Codigo))
            .ToList();

        return new PagedResult<ProductoResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<ProductoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var producto = await dbContext
            .Productos
            .AsNoTracking()
            .Include(x => x.CategoriaProducto)
            .Include(x => x.Marca)
            .Include(x => x.UnidadMedida)
            .Include(x => x.Proveedor)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (producto is null || !producto.Activo)
        {
            throw new NotFoundException(nameof(ProductoEntity), id);
        }

        return Mapear(
            producto,
            producto.CategoriaProducto?.Nombre,
            producto.Marca?.Nombre,
            producto.Marca?.Codigo,
            producto.UnidadMedida?.Nombre,
            producto.UnidadMedida?.Simbolo,
            producto.UnidadMedida?.Categoria,
            producto.Proveedor?.RazonSocial,
            producto.Proveedor?.Codigo);
    }

    public async Task<byte[]> ExportarExcelAsync(
        int? categoriaProductoId,
        int? marcaId,
        int? proveedorId,
        int? unidadMedidaId,
        string? categoriaUnidadMedida,
        bool? controlaLote,
        bool? controlaVencimiento,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .Productos
            .AsNoTracking()
            .Where(x => x.Activo);

        if (categoriaProductoId.HasValue)
        {
            query = query.Where(x => x.CategoriaProductoId == categoriaProductoId.Value);
        }

        if (marcaId.HasValue)
        {
            query = query.Where(x => x.MarcaId == marcaId.Value);
        }

        if (proveedorId.HasValue)
        {
            query = query.Where(x => x.ProveedorId == proveedorId.Value);
        }

        if (unidadMedidaId.HasValue)
        {
            query = query.Where(x => x.UnidadMedidaId == unidadMedidaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(categoriaUnidadMedida))
        {
            var catUm = categoriaUnidadMedida.Trim();
            query = query.Where(x => x.UnidadMedida.Categoria == catUm);
        }

        if (controlaLote.HasValue)
        {
            query = query.Where(x => x.ControlaLote == controlaLote.Value);
        }

        if (controlaVencimiento.HasValue)
        {
            query = query.Where(x => x.ControlaVencimiento == controlaVencimiento.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(termino) ||
                x.Nombre.Contains(termino) ||
                (x.Descripcion != null && x.Descripcion.Contains(termino)) ||
                (x.Marca != null && (x.Marca.Nombre.Contains(termino) || x.Marca.Codigo.Contains(termino))) ||
                (x.Proveedor != null && (x.Proveedor.RazonSocial.Contains(termino) || x.Proveedor.Codigo.Contains(termino))));
        }

        var productos = await query
            .OrderBy(x => x.Nombre)
            .Include(x => x.CategoriaProducto)
            .Include(x => x.Marca)
            .Include(x => x.UnidadMedida)
            .Include(x => x.Proveedor)
            .ToListAsync(cancellationToken);

        var options = new ExcelReportOptions
        {
            Title = "Reporte de Catálogo de Productos e Insumos",
            Subtitle = "Almacenes & Logística - Gestión Integral de Inventario",
            SheetName = "Productos",
            HeaderColor = "#059669", // Emerald
            GeneratedBy = currentUserService.UserId?.ToString()
        };

        return excelReportGenerator.Generate(options, productos, builder =>
        {
            builder.AddColumn("Código", x => x.Codigo, ExcelColumnAlignment.Center);
            builder.AddColumn("Nombre del Producto", x => x.Nombre);
            builder.AddColumn("Descripción", x => x.Descripcion ?? string.Empty);
            builder.AddColumn("Categoría", x => x.CategoriaProducto?.Nombre ?? "Sin categoría");
            builder.AddColumn("Marca", x => x.Marca?.Nombre ?? "Sin marca");
            builder.AddColumn("Catálogo / Grupo U.M.", x => x.UnidadMedida?.Categoria ?? string.Empty);
            builder.AddColumn("Unidad Medida", x => x.UnidadMedida?.Nombre ?? string.Empty);
            builder.AddColumn("Símbolo", x => x.UnidadMedida?.Simbolo ?? string.Empty, ExcelColumnAlignment.Center);
            builder.AddColumn("Proveedor", x => x.Proveedor?.RazonSocial ?? "Sin proveedor");
            builder.AddColumn("Cód. Proveedor", x => x.Proveedor?.Codigo ?? string.Empty, ExcelColumnAlignment.Center);
            builder.AddBooleanColumn("Controla Lote", x => x.ControlaLote, trueText: "SÍ", falseText: "NO");
            builder.AddBooleanColumn("Controla Venc.", x => x.ControlaVencimiento, trueText: "SÍ", falseText: "NO");
            builder.AddNumberColumn("Stock Mínimo", x => x.StockMinimo, "#,##0.00");
            builder.AddNumberColumn("Stock Máximo", x => x.StockMaximo, "#,##0.00");
            builder.AddBooleanColumn("Estado", x => x.Activo, trueText: "Activo", falseText: "Inactivo");
        });
    }

    public async Task<ProductoResponse> CrearAsync(
        CreateProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.CategoriaProductoId,
            request.MarcaId,
            request.UnidadMedidaId,
            request.ProveedorId,
            cancellationToken);

        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: null,
            cancellationToken);

        var entity = ProductoMapper.ToEntity(request);
        Normalizar(entity, request, esNuevo: true);

        dbContext.Productos.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<ProductoResponse> ActualizarAsync(
        int id,
        UpdateProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.CategoriaProductoId,
            request.MarcaId,
            request.UnidadMedidaId,
            request.ProveedorId,
            cancellationToken);

        var entity = await dbContext.Productos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ProductoEntity), id);
        }

        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: id,
            cancellationToken);

        ProductoMapper.UpdateEntity(request, entity);
        Normalizar(entity, request, esNuevo: false);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Productos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ProductoEntity), id);
        }

        dbContext.Productos.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarReferenciasAsync(
        int categoriaProductoId,
        int? marcaId,
        int unidadMedidaId,
        int? proveedorId,
        CancellationToken cancellationToken)
    {
        var existeCategoria = await dbContext.CategoriasProducto
            .AnyAsync(
                x => x.Id == categoriaProductoId && x.Activo,
                cancellationToken);

        if (!existeCategoria)
        {
            throw new NotFoundException(
                nameof(CategoriaProductoEntity),
                categoriaProductoId);
        }

        if (marcaId.HasValue)
        {
            var existeMarca = await dbContext.Marcas
                .AnyAsync(
                    x => x.Id == marcaId.Value && x.Activo,
                    cancellationToken);

            if (!existeMarca)
            {
                throw new NotFoundException(
                    nameof(MarcaEntity),
                    marcaId.Value);
            }
        }

        var existeUnidad = await dbContext.UnidadesMedida
            .AnyAsync(
                x => x.Id == unidadMedidaId && x.Activo,
                cancellationToken);

        if (!existeUnidad)
        {
            throw new NotFoundException(
                nameof(UnidadesMedidaEntity),
                unidadMedidaId);
        }

        if (proveedorId.HasValue)
        {
            var existeProveedor = await dbContext.Proveedores
                .AnyAsync(
                    x => x.Id == proveedorId.Value && x.Activo,
                    cancellationToken);

            if (!existeProveedor)
            {
                throw new NotFoundException(
                    nameof(ProveedorEntity),
                    proveedorId.Value);
            }
        }
    }

    private async Task ValidarCodigoUnicoAsync(
        string codigo,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var codigoNormalizado = NormalizarCodigo(codigo);

        var existe = await dbContext.Productos
            .AnyAsync(
                x => x.Codigo == codigoNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un producto con el código '{codigoNormalizado}'.");
        }
    }

    private static ProductoResponse Mapear(
        ProductoEntity entity,
        string? nombreCategoria,
        string? nombreMarca,
        string? codigoMarca,
        string? nombreUnidad,
        string? simboloUnidad,
        string? categoriaUnidad,
        string? razonSocialProveedor,
        string? codigoProveedor)
    {
        var response = ProductoMapper.ToResponse(entity);
        return response with
        {
            CategoriaProductoNombre = nombreCategoria,
            MarcaId = entity.MarcaId,
            MarcaNombre = nombreMarca,
            MarcaCodigo = codigoMarca,
            UnidadMedidaNombre = nombreUnidad,
            UnidadMedidaSimbolo = simboloUnidad,
            UnidadMedidaCategoria = categoriaUnidad,
            ProveedorId = entity.ProveedorId,
            ProveedorRazonSocial = razonSocialProveedor,
            ProveedorCodigo = codigoProveedor
        };
    }

    private static void Normalizar(
        ProductoEntity entity,
        ProductoRequest request,
        bool esNuevo)
    {
        entity.Codigo = NormalizarCodigo(request.Codigo);
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = Limpiar(request.Descripcion);
        entity.MarcaId = request.MarcaId;
        entity.ProveedorId = request.ProveedorId;

        if (esNuevo)
        {
            entity.ControlaLote = request.ControlaLote;
            entity.ControlaVencimiento = request.ControlaVencimiento;
        }

        if (request.StockMaximo.HasValue &&
            request.StockMinimo > request.StockMaximo.Value)
        {
            throw new BusinessException(
                "El stock mínimo no puede ser mayor que el stock máximo.");
        }
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
