using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;

public abstract record EmpleadoRequest
{
    public int PersonaId { get; init; }
    public DateOnly? FechaIngreso { get; init; }
    public DateOnly? FechaRetiro { get; init; }
}

public sealed record CreateEmpleadoRequest : EmpleadoRequest;

public sealed record UpdateEmpleadoRequest : EmpleadoRequest;

public sealed record EmpleadoResponse : AuditableResponse
{
    public int Id { get; init; }
    public int PersonaId { get; init; }
    public PersonaInfoResponse? Persona { get; init; }
    public string? CodigoEmpleado { get; init; }

    public DateOnly? FechaIngreso { get; init; }
    public DateOnly? FechaRetiro { get; init; }
}

public sealed record PersonaInfoResponse
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