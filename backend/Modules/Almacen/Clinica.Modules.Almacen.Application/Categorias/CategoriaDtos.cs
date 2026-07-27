namespace Clinica.Modules.Almacen.Application.Categorias;

public sealed record CategoriaResponse(Guid Id, string Codigo, string Nombre, bool Activo);
public sealed record CreateCategoriaRequest(string Codigo, string Nombre, bool Activo = true);
public sealed record UpdateCategoriaRequest(string Codigo, string Nombre, bool Activo);
