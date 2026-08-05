using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.Parametros.Catalogo.Dtos;

public abstract record CatalogoItemRequest
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public required string Valor { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string Nombre { get; init; }

    public int Orden { get; init; }
}

public sealed record CreateCatalogoItemRequest : CatalogoItemRequest;

public sealed record UpdateCatalogoItemRequest : CatalogoItemRequest;

public sealed record CatalogoItemResponse(
    int Id,
    int CatalogoGrupoId,
    string Valor,
    string Nombre,
    int Orden,
    bool Activo,
    DateTime FechaCreacion,
    DateTime? FechaModificacion,
    string? CreadoPor,
    string? ModificadoPor
);