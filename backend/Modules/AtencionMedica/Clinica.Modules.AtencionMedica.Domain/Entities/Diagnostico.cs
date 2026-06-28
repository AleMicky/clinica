using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class Diagnostico : AuditableEntity
{
    public string CodigoCie10 { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public ICollection<DiagnosticoAtencion> Atenciones { get; set; } = [];
}