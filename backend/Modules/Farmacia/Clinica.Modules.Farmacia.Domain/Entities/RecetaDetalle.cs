using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Farmacia.Domain.Entities;

public class RecetaDetalle : AuditableEntity
{
    public Guid RecetaId { get; set; }
    public Receta Receta { get; set; } = null!;
    public Guid ProductoId { get; set; }
    public decimal Cantidad { get; set; }
    public string? Indicaciones { get; set; }
}
