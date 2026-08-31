using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Producto.Dtos;

public abstract record ProductoRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }

    public required int CategoriaProductoId { get; init; }
    public required int UnidadMedidaId { get; init; }

    public bool ControlaLote { get; init; }
    public bool ControlaVencimiento { get; init; }

    public decimal StockMinimo { get; init; }
    public decimal? StockMaximo { get; init; }
}

public sealed record CreateProductoRequest : ProductoRequest;

public sealed record UpdateProductoRequest : ProductoRequest;

public sealed record ProductoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }

    public int CategoriaProductoId { get; init; }
    public string? CategoriaProductoNombre { get; init; }

    public int UnidadMedidaId { get; init; }
    public string? UnidadMedidaNombre { get; init; }
    public string? UnidadMedidaSimbolo { get; init; }

    public bool ControlaLote { get; init; }
    public bool ControlaVencimiento { get; init; }

    public decimal StockMinimo { get; init; }
    public decimal? StockMaximo { get; init; }
}
