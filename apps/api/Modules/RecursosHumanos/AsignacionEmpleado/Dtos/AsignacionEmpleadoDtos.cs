using System.ComponentModel.DataAnnotations;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;

public abstract record AsignacionEmpleadoRequest
{
    [Required]
    [Range(1, int.MaxValue)]
    public required int EmpleadoId { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public required int AreaId { get; init; }

    [Required]
    [Range(1, int.MaxValue)]
    public required int CargoId { get; init; }

    public DateOnly FechaInicio { get; init; }

    public DateOnly? FechaFin { get; init; }

    [StringLength(500)]
    public string? Observacion { get; init; }
}

public sealed record CreateAsignacionEmpleadoRequest
    : AsignacionEmpleadoRequest;

public sealed record UpdateAsignacionEmpleadoRequest
    : AsignacionEmpleadoRequest;

public sealed record AsignacionEmpleadoResponse
{
    public int Id { get; init; }
    public int EmpleadoId { get; init; }
    public EmpleadoInfo? Empleado { get; init; }
    public int AreaId { get; init; }
    public AreaInfo? Area { get; init; }
    public int CargoId { get; init; }
    public CargoInfo? Cargo { get; init; }
    public DateOnly FechaInicio { get; init; }
    public DateOnly? FechaFin { get; init; }
    public string? Observacion { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
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