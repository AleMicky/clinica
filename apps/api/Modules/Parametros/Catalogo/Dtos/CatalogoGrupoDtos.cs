using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.Parametros.Catalogo.Dtos;

public abstract record CatalogoGrupoRequest
{
    [Required]
    [StringLength(30, MinimumLength = 2)]
    public required string Codigo { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Nombre { get; init; }

    [StringLength(250)] public string? Descripcion { get; init; }
}

public sealed record CreateCatalogoGrupoRequest : CatalogoGrupoRequest;

public sealed record UpdateCatalogoGrupoRequest : CatalogoGrupoRequest;

public sealed record CatalogoGrupoResponse(
    int Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    bool Activo,
    DateTime FechaCreacion,
    DateTime? FechaModificacion,
    string? CreadoPor,
    string? ModificadoPor
);