using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Personas.Entity;

public sealed class Persona : AuditableEntity
{
    // Datos personales
    public string Nombres { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string? ApellidoMaterno { get; set; }

    public DateOnly FechaNacimiento { get; set; }

    // Contacto
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }

    // Documento de identidad
    public string TipoDocumento { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public string? ExtensionDocumento { get; set; }
    public string? ComplementoDocumento { get; set; }

    // Información adicional
    public string? Genero { get; set; }
    public string? EstadoCivil { get; set; }
}