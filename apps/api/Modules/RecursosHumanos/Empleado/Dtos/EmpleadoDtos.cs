using System.ComponentModel.DataAnnotations;
using Clinica.Api.Modules.Seguridad.Personas.Dtos;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;

public abstract record EmpleadoRequest
{
    [Required]
    [Range(1, int.MaxValue)]
    public required int PersonaId { get; init; }

    [Required]
    [StringLength(30, MinimumLength = 1)]
    public required string CodigoEmpleado { get; init; }

    public DateOnly FechaIngreso { get; init; }

    public DateOnly? FechaRetiro { get; init; }
}

public sealed record CreateEmpleadoRequest : EmpleadoRequest;

public sealed record UpdateEmpleadoRequest : EmpleadoRequest;

public sealed record EmpleadoResponse
{
    public int Id { get; init; }
    public int PersonaId { get; init; }
    public PersonaResponse? Persona { get; init; }
    public string CodigoEmpleado { get; init; } = string.Empty;
    public DateOnly FechaIngreso { get; init; }
    public DateOnly? FechaRetiro { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
}