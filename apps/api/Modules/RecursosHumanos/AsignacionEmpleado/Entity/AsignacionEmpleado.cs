using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity;

public sealed class AsignacionEmpleado : AuditableEntity
{
    public int EmpleadoId { get; set; }
    public Empleado.Entity.Empleado Empleado { get; set; } = null!;

    public int AreaId { get; set; }
    public Area.Entity.Area Area { get; set; } = null!;

    public int CargoId { get; set; }
    public Cargo.Entity.Cargo Cargo { get; set; } = null!;

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }

    public string? Observacion { get; set; }
}