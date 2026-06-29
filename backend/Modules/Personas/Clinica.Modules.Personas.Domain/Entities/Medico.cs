using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class Medico : AuditableEntity
{
    public Guid EmpleadoId { get; set; }
    public Empleado Empleado { get; set; } = null!;

    public ICollection<MedicoEspecialidad> Especialidades { get; set; } = [];

    public string MatriculaProfesional { get; set; } = string.Empty;
    public string? RegistroColegioMedico { get; set; }
}