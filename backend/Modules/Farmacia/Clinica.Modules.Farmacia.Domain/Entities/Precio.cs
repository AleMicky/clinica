using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Farmacia.Domain.Entities;

public class Precio : AuditableEntity
{
    public Guid ProductoId { get; set; }
    public decimal Importe { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public string MotivoCambio { get; set; } = string.Empty;
}
