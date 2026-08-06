using System.ComponentModel.DataAnnotations;
using Clinica.Api.Modules.Seguridad.Personas.Dtos;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

public record PersonaUsuarioRequest
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

public record CreateUsuarioRequest(
    PersonaUsuarioRequest Persona,
    string Email,
    string UserName,
    string Password,
    List<string> Roles);

public record UpdateUsuarioRequest(
    string Email,
    string UserName,
    bool Activo,
    List<string> Roles);

public record UsuarioResponse
{
    public int Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public bool Activo { get; init; }
    public bool DebeCambiarPassword { get; init; }
    public PersonaResponse? Persona { get; init; }
    public List<string> Roles { get; init; } = [];
}