using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class Tratamiento : AuditableEntity
{
    public Guid AtencionId { get; set; }
    public Atencion Atencion { get; set; } = null!;

    public string Descripcion { get; set; } = string.Empty;
    public string? Indicaciones { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
}