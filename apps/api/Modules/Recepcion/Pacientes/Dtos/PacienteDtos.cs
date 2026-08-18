using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Dtos;

public abstract record PacienteRequest
{
    public required string Nombres { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required DateOnly FechaNacimiento { get; init; }
    public string? Telefono { get; init; }
    public string? Direccion { get; init; }
    public string TipoDocumento { get; init; } = string.Empty;
    public required string NumeroDocumento { get; init; }
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}

public sealed record CreatePacienteRequest : PacienteRequest;

public sealed record UpdatePacienteRequest : PacienteRequest;

public sealed record PacienteResponse : AuditableResponse
{
    public int Id { get; init; }
    public required string NumeroHistoriaClinica { get; init; }
    public required PacientePersonaResponse Persona { get; init; }
}

public sealed record PacientePersonaResponse
{
    public int Id { get; init; }
    public required string Nombres { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public DateOnly FechaNacimiento { get; init; }
    public string? Telefono { get; init; }
    public string? Direccion { get; init; }
    public required string? TipoDocumento { get; init; }
    public required string NumeroDocumento { get; init; }
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}

public abstract record PacienteConvenioRequest
{
    public required int ConvenioId { get; init; }
    public string? NumeroAfiliado { get; init; }
    public required DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
    public bool EsPrincipal { get; init; }
}

public sealed record CreatePacienteConvenioRequest : PacienteConvenioRequest;

public sealed record UpdatePacienteConvenioRequest : PacienteConvenioRequest;

public sealed record PacienteConvenioResponse
{
    public int Id { get; init; }
    public int PacienteId { get; init; }
    public int ConvenioId { get; init; }
    public ConvenioInfo? Convenio { get; init; }
    public string? NumeroAfiliado { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
    public bool EsPrincipal { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
}

public sealed record ConvenioInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}

public sealed record PacienteBaseInfo
{
    public int Id { get; init; }
    public required string NumeroHistoriaClinica { get; init; }
    public string NombreCompleto { get; init; } = string.Empty;
    
}