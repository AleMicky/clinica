using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class DiagnosticoAtencion : AuditableEntity
{
    public Guid AtencionId { get; set; }
    public Atencion Atencion { get; set; } = null!;

    public Guid DiagnosticoId { get; set; }
    public Diagnostico Diagnostico { get; set; } = null!;

    public bool EsPrincipal { get; set; }
    public string? Observaciones { get; set; }
}