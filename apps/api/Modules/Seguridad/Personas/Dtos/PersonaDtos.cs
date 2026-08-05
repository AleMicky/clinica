using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.Seguridad.Personas.Dtos;

public abstract record PersonaRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public required string Nombres { get; init; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public required string ApellidoPaterno { get; init; }

    [StringLength(50)]
    public string? ApellidoMaterno { get; init; }

    public DateOnly FechaNacimiento { get; init; }

    [StringLength(30)]
    public string? Telefono { get; init; }

    [StringLength(200)]
    public string? Direccion { get; init; }

    [Required]
    [StringLength(20, MinimumLength = 1)]
    public required string TipoDocumento { get; init; }

    [Required]
    [StringLength(20, MinimumLength = 1)]
    public required string NumeroDocumento { get; init; }

    [StringLength(5)]
    public string? ExtensionDocumento { get; init; }

    [StringLength(10)]
    public string? ComplementoDocumento { get; init; }

    [StringLength(20)]
    public string? Genero { get; init; }

    [StringLength(20)]
    public string? EstadoCivil { get; init; }
}

public sealed record CreatePersonaRequest : PersonaRequest;

public sealed record UpdatePersonaRequest : PersonaRequest;

public sealed record PersonaResponse
{
    public int Id { get; init; }
    public string Nombres { get; init; } = string.Empty;
    public string ApellidoPaterno { get; init; } = string.Empty;
    public string? ApellidoMaterno { get; init; }
    public DateOnly FechaNacimiento { get; init; }
    public string? Telefono { get; init; }
    public string? Direccion { get; init; }
    public string TipoDocumento { get; init; } = string.Empty;
    public string NumeroDocumento { get; init; } = string.Empty;
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
}