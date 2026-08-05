using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Entity;

public sealed class Cargo : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<AsignacionEmpleado.Entity.AsignacionEmpleado>
        Asignaciones { get; set; } = [];
}