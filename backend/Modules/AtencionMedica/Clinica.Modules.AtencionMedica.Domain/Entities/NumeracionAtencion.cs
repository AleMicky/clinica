using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class NumeracionAtencion : AuditableEntity
{
    public Guid TipoAtencionId { get; set; }
    public TipoAtencion TipoAtencion { get; set; } = null!;

    public int Gestion { get; set; }
    public int UltimoCorrelativo { get; set; }
}
