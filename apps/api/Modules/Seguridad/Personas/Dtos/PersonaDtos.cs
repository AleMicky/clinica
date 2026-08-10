using System.ComponentModel.DataAnnotations;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Personas.Dtos;

public abstract record PersonaRequest
{
    public required string Nombres { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public DateOnly FechaNacimiento { get; init; }
    public string? Telefono { get; init; }
    public string? Direccion { get; init; }
    public required string TipoDocumento { get; init; }
    public required string NumeroDocumento { get; init; }
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}

public sealed record CreatePersonaRequest : PersonaRequest;

public sealed record UpdatePersonaRequest : PersonaRequest;

public sealed record PersonaResponse : AuditableResponse
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
}