namespace Clinica.Modules.Almacen.Application.Categorias;

public sealed record CategoriaProductoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion);

public sealed record CreateCategoriaProductoRequest(
    string Codigo,
    string Nombre,
    string? Descripcion = null);

public sealed record UpdateCategoriaProductoRequest(
    string Codigo,
    string Nombre,
    string? Descripcion);
