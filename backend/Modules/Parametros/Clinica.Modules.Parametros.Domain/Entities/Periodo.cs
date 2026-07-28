using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class Periodo : AuditableEntity
{
    public Guid GestionId { get; set; }
    public Gestion Gestion { get; set; } = null!;
    public int Numero { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
    public string Literal { get; set; } = string.Empty;
}
