using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Personas.Entity;

public sealed class Persona : AuditableEntity
{
    public string Nombres { get; set; } = null!;
    public string ApellidoPaterno { get; set; } = null!;
    public string? ApellidoMaterno { get; set; }
    public DateOnly FechaNacimiento { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public string TipoDocumento { get; set; } = null!;
    public string NumeroDocumento { get; set; } = null!;
    public string? ExtensionDocumento { get; set; }
    public string? ComplementoDocumento { get; set; }
    public string? Genero { get; set; }
    public string? EstadoCivil { get; set; }
}