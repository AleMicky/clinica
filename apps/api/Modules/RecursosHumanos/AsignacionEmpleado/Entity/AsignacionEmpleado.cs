using Clinica.Api.Shared.Abstractions;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;
using CargoEntity = Clinica.Api.Modules.RecursosHumanos.Cargo.Entity.Cargo;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity;

public sealed class AsignacionEmpleado : AuditableEntity
{
    public int EmpleadoId { get; set; }
    public EmpleadoEntity Empleado { get; set; } = null!;

    public int AreaId { get; set; }
    public AreaEntity Area { get; set; } = null!;

    public int CargoId { get; set; }
    public CargoEntity Cargo { get; set; } = null!;

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }

    public string? Observacion { get; set; }
}