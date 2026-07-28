using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class Gestion : AuditableEntity
{
    public int NumeroGestion { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
    public string Literal { get; set; } = string.Empty;
    public bool Activa { get; set; }
    public ICollection<Periodo> Periodos { get; set; } = [];
}
