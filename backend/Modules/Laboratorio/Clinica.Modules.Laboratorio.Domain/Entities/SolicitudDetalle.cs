using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class SolicitudDetalle : AuditableEntity
{
    public Guid SolicitudId { get; set; }
    public Solicitud Solicitud { get; set; } = null!;
    public Guid PruebaId { get; set; }
    public Prueba Prueba { get; set; } = null!;
    public decimal PrecioUnitario { get; set; }
    public decimal Cantidad { get; set; } = 1;
    public bool EsDerivada { get; set; }
    public string? Observaciones { get; set; }
}
