using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class PruebaPrecio : AuditableEntity
{
    public Guid PruebaId { get; set; }
    public Prueba Prueba { get; set; } = null!;
    public decimal ImporteFacturado { get; set; }
    public decimal CostoLaboratorio { get; set; }
    public decimal CostoDerivacion { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public string MotivoCambio { get; set; } = string.Empty;
}
