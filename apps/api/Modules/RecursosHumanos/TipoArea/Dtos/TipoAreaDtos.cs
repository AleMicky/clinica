using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.RecursosHumanos.TipoArea.Dtos;

public abstract record TipoAreaRequest
{
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public required string Codigo { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string Nombre { get; init; }

    [StringLength(250)]
    public string? Descripcion { get; init; }

    public int Orden { get; init; }
}

public sealed record CreateTipoAreaRequest : TipoAreaRequest;

public sealed record UpdateTipoAreaRequest : TipoAreaRequest;

public sealed record TipoAreaResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Descripcion { get; init; }
    public int Orden { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
}