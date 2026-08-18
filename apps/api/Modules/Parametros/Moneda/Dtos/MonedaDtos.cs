using System.ComponentModel.DataAnnotations;
using Clinica.Api.Shared.Abstractions;

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

    [Range(0, 8)] public int Decimales { get; init; } = 2;
    public bool EsBase { get; init; }
}

public sealed record CreateMonedaRequest : MonedaRequest;

public sealed record UpdateMonedaRequest : MonedaRequest;

public sealed record MonedaResponse : AuditableResponse
{
    public int Id { get; init; }
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public required string Simbolo { get; init; }
    public int Decimales { get; init; }
    public bool EsBase { get; init; }
}

public sealed record MonedaInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}