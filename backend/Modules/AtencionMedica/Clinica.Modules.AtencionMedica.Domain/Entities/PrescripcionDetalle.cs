using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class PrescripcionDetalle : AuditableEntity
{
    public Guid PrescripcionId { get; set; }
    public Prescripcion Prescripcion { get; set; } = null!;

    public Guid? MedicamentoId { get; set; }

    public string MedicamentoNombre { get; set; } = string.Empty;
    public string Dosis { get; set; } = string.Empty;
    public string Frecuencia { get; set; } = string.Empty;
    public string Duracion { get; set; } = string.Empty;
    public string? ViaAdministracion { get; set; }
    public string? Indicaciones { get; set; }
}