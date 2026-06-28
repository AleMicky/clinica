using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class Interconsulta : AuditableEntity
{
    public Guid AtencionId { get; set; }
    public Atencion Atencion { get; set; } = null!;

    public Guid EspecialidadId { get; set; }
    public Guid? MedicoId { get; set; }
    
    public string Motivo { get; set; } = string.Empty;
    public string? Respuesta { get; set; }
    public DateTime FechaSolicitud { get; set; } = DateTime.UtcNow;
    public DateTime? FechaRespuesta { get; set; }
}