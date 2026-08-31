using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.CategoriaProducto.Dtos;

public abstract record CategoriaProductoRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public int? CategoriaPadreId { get; init; }
}

public sealed record CreateCategoriaProductoRequest : CategoriaProductoRequest;

public sealed record UpdateCategoriaProductoRequest : CategoriaProductoRequest;

public sealed record CategoriaProductoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public int? CategoriaPadreId { get; init; }
    public string? CategoriaPadreNombre { get; init; }
    public int CantidadSubcategorias { get; init; }
}
