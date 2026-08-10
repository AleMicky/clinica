using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Entity;

public sealed class Medico : AuditableEntity
{
    public int EmpleadoId { get; set; }
    public Empleado.Entity.Empleado Empleado { get; set; } = null!;
    public string? MatriculaProfesional { get; set; }
    public string? RegistroMinisterioSalud { get; set; }

    public ICollection<MedicoEspecialidad> Especialidades { get; set; } = [];
}