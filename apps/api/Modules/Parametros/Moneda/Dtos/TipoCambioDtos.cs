using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.Parametros.Moneda.Dtos;

public abstract record TipoCambioRequest
{
    [Required]
    public required int MonedaOrigenId { get; init; }

    [Required]
    public required int MonedaDestinoId { get; init; }

    [Required]
    [Range(0.0001, double.MaxValue)]
    public required decimal Compra { get; init; }

    [Required]
    [Range(0.0001, double.MaxValue)]
    public required decimal Venta { get; init; }

    [Required]
    public required DateOnly Fecha { get; init; }
}

public sealed record CreateTipoCambioRequest : TipoCambioRequest;

public sealed record UpdateTipoCambioRequest : TipoCambioRequest;

public sealed record TipoCambioResponse(
    int Id,
    int MonedaOrigenId,
    int MonedaDestinoId,
    decimal Compra,
    decimal Venta,
    DateOnly Fecha,
    bool Activo,
    DateTime FechaCreacion,
    DateTime? FechaModificacion,
    string? CreadoPor,
    string? ModificadoPor
);