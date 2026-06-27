using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class Especialidad : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}