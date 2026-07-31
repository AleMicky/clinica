using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class FormaFarmaceutica : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }

    public ICollection<MedicamentoDetalle> Medicamentos { get; set; } = [];
}