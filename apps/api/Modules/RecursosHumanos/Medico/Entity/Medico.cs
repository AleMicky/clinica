using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Entity;

public sealed class Medico : AuditableEntity
{
    public int EmpleadoId { get; set; }
    public Empleado.Entity.Empleado Empleado { get; set; } = null!;

    public string MatriculaProfesional { get; set; } = string.Empty;

    public string? RegistroMinisterioSalud { get; set; }
}