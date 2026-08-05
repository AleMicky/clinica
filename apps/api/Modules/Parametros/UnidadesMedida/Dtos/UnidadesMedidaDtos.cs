using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;

public abstract record UnidadesMedidaRequest
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public required string Codigo { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Nombre { get; init; }

    [Required]
    [StringLength(20, MinimumLength = 1)]
    public required string Simbolo { get; init; }
}

public sealed record CreateUnidadesMedidaRequest : UnidadesMedidaRequest;

public sealed record UpdateUnidadesMedidaRequest : UnidadesMedidaRequest;

public sealed record UnidadesMedidaResponse(
    int Id,
    string Codigo,
    string Nombre,
    string Simbolo,
    bool Activo,
    DateTime FechaCreacion,
    DateTime? FechaModificacion,
    string? CreadoPor,
    string? ModificadoPor
);