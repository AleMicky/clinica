using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;

public abstract record MedicoRequest
{
    public required int EmpleadoId { get; init; }
    public required string MatriculaProfesional { get; init; }
    public string? RegistroMinisterioSalud { get; init; }
}

public sealed record CreateMedicoRequest : MedicoRequest;

public sealed record UpdateMedicoRequest : MedicoRequest;

public sealed record MedicoResponse : AuditableResponse
{
    public int Id { get; init; }
    public int EmpleadoId { get; init; }
    public EmpleadoInfo? Empleado { get; init; }
    public string MatriculaProfesional { get; init; }
    public string? RegistroMinisterioSalud { get; init; }
}

public sealed record EmpleadoInfo
{
    public int Id { get; init; }
    public string CodigoEmpleado { get; init; } = string.Empty;
    public string NombreCompleto { get; init; } = string.Empty;
    public PersonaInfo Persona { get; init; } = null!;
}

public sealed record PersonaInfo
{
    public int Id { get; init; }
    public string Nombres { get; init; } = string.Empty;
    public string ApellidoPaterno { get; init; } = string.Empty;
    public string? ApellidoMaterno { get; init; }
}