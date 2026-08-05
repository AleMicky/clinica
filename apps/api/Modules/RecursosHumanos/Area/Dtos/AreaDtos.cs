using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Dtos;

public abstract record AreaRequest
{
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public required string Codigo { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string Nombre { get; init; }

    [StringLength(250)]
    public string? Descripcion { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public required int TipoAreaId { get; init; }

    [Range(1, int.MaxValue)]
    public int? AreaPadreId { get; init; }
}

public sealed record CreateAreaRequest : AreaRequest;

public sealed record UpdateAreaRequest : AreaRequest;

public sealed record AreaResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Descripcion { get; init; }
    public int TipoAreaId { get; init; }
    public string? TipoAreaNombre { get; init; }
    public int? AreaPadreId { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
}

public sealed record AreaArbolResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public int TipoAreaId { get; init; }
    public string? TipoAreaNombre { get; init; }
    public List<AreaArbolResponse> Subareas { get; init; } = [];
}