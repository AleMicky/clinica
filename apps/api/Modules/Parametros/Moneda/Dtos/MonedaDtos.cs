using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.Parametros.Moneda.Dtos;

public abstract record MonedaRequest
{
    [Required]
    [StringLength(10, MinimumLength = 2)]
    public required string Codigo { get; init; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public required string Nombre { get; init; }

    [Required]
    [StringLength(10, MinimumLength = 1)]
    public required string Simbolo { get; init; }

    [Range(0, 8)]
    public int Decimales { get; init; } = 2;

    public bool EsBase { get; init; }
}

public sealed record CreateMonedaRequest : MonedaRequest;

public sealed record UpdateMonedaRequest : MonedaRequest;

public sealed record MonedaResponse(
    int Id,
    string Codigo,
    string Nombre,
    string Simbolo,
    int Decimales,
    bool EsBase,
    bool Activo,
    DateTime FechaCreacion,
    DateTime? FechaModificacion,
    string? CreadoPor,
    string? ModificadoPor
);