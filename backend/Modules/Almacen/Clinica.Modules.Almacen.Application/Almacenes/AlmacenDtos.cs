namespace Clinica.Modules.Almacen.Application.Almacenes;

public sealed record TipoAlmacenResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion);

public sealed record AlmacenResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    Guid TipoAlmacenId,
    string TipoAlmacenNombre,
    Guid? ResponsableEmpleadoId,
    bool PermiteVenta,
    bool PermiteDispensacion,
    bool PermiteStockNegativo);

public sealed record CreateAlmacenRequest(
    string Codigo,
    string Nombre,
    Guid TipoAlmacenId,
    string? Descripcion = null,
    Guid? ResponsableEmpleadoId = null,
    bool PermiteVenta = false,
    bool PermiteDispensacion = false,
    bool PermiteStockNegativo = false);

public sealed record UpdateAlmacenRequest(
    string Codigo,
    string Nombre,
    Guid TipoAlmacenId,
    string? Descripcion,
    Guid? ResponsableEmpleadoId,
    bool PermiteVenta,
    bool PermiteDispensacion,
    bool PermiteStockNegativo);
