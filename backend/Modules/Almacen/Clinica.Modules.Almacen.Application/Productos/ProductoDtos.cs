namespace Clinica.Modules.Almacen.Application.Productos;

public sealed record ProductoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    Guid CategoriaId,
    string CategoriaNombre,
    Guid UnidadMedidaId,
    decimal StockMinimo,
    bool ControlaLote,
    bool ControlaVencimiento,
    bool EsMedicamento,
    bool Activo);

public sealed record CreateProductoRequest(
    string Codigo,
    string Nombre,
    Guid CategoriaId,
    Guid UnidadMedidaId,
    decimal StockMinimo = 0,
    bool ControlaLote = true,
    bool ControlaVencimiento = true,
    bool EsMedicamento = false,
    bool Activo = true);

public sealed record UpdateProductoRequest(
    string Codigo,
    string Nombre,
    Guid CategoriaId,
    Guid UnidadMedidaId,
    decimal StockMinimo,
    bool ControlaLote,
    bool ControlaVencimiento,
    bool EsMedicamento,
    bool Activo);
