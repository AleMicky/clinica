using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class Paciente : AuditableEntity
{
    public Guid PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;
    public string NumeroHistoriaClinica { get; set; } = string.Empty;
    public Guid? GrupoSanguineoId { get; set; }
    public CatalogoItem? GrupoSanguineo { get; set; }
    public string? Alergias { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
}