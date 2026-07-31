namespace Clinica.Modules.Almacen.Application.Productos;

public sealed record MedicamentoDetalleDto(
    string? NombreGenerico = null,
    string? NombreComercial = null,
    string? Concentracion = null,
    string? Presentacion = null,
    Guid? FormaFarmaceuticaId = null,
    bool RequiereReceta = false,
    bool EsControlado = false);

public sealed record ProductoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    string? CodigoBarras,
    Guid CategoriaId,
    string CategoriaNombre,
    Guid UnidadMedidaId,
    string? UnidadMedidaNombre,
    decimal StockMinimo,
    decimal StockMaximo,
    bool ControlaLote,
    bool ControlaVencimiento,
    bool ManejaSerie,
    bool EsMedicamento,
    bool Activo,
    MedicamentoDetalleDto? Medicamento = null);

public sealed record CreateProductoRequest(
    string Codigo,
    string Nombre,
    Guid CategoriaId,
    Guid UnidadMedidaId,
    string? Descripcion = null,
    string? CodigoBarras = null,
    decimal StockMinimo = 0,
    decimal StockMaximo = 0,
    bool ControlaLote = true,
    bool ControlaVencimiento = true,
    bool ManejaSerie = false,
    bool EsMedicamento = false,
    bool Activo = true,
    MedicamentoDetalleDto? Medicamento = null);

public sealed record UpdateProductoRequest(
    string Codigo,
    string Nombre,
    Guid CategoriaId,
    Guid UnidadMedidaId,
    string? Descripcion,
    string? CodigoBarras,
    decimal StockMinimo,
    decimal StockMaximo,
    bool ControlaLote,
    bool ControlaVencimiento,
    bool ManejaSerie,
    bool EsMedicamento,
    bool Activo,
    MedicamentoDetalleDto? Medicamento = null);
