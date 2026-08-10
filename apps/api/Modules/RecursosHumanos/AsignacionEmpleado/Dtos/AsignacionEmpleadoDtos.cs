using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;

public abstract record AsignacionEmpleadoRequest
{
    public required int EmpleadoId { get; init; }
    public required int AreaId { get; init; }
    public required int CargoId { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
    public string? Observacion { get; init; }
}

public sealed record CreateAsignacionEmpleadoRequest : AsignacionEmpleadoRequest;

public sealed record UpdateAsignacionEmpleadoRequest : AsignacionEmpleadoRequest;

public sealed record AsignacionEmpleadoResponse : AuditableResponse
{
    public int Id { get; init; }
    public EmpleadoInfo? Empleado { get; init; }
    public AreaInfo? Area { get; init; }
    public CargoInfo? Cargo { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
    public string? Observacion { get; init; }
}

public sealed record EmpleadoInfo
{
    public int Id { get; init; }
    public string CodigoEmpleado { get; init; } = string.Empty;
    public string NombreCompleto { get; init; } = string.Empty;
}

public sealed record AreaInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}

public sealed record CargoInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}