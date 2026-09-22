namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;

public record EmpleadoPersonaRequest
{
    public required DateOnly FechaIngreso { get; init; }
    public DateOnly? FechaRetiro { get; init; }

    public required PersonaCreateDto Persona { get; init; }
}

public record PersonaCreateDto
{
    public required string Nombres { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required DateOnly FechaNacimiento { get; init; }
    public string? Telefono { get; init; }
    public string? Direccion { get; init; }
    public required string TipoDocumento { get; init; }
    public required string NumeroDocumento { get; init; }
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}