using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class SolicitudPago : AuditableEntity
{
    public Guid SolicitudId { get; set; }
    public Solicitud Solicitud { get; set; } = null!;
    public Guid CuentaId { get; set; }
    public decimal MontoTotal { get; set; }
    public DateTime FechaEnvio { get; set; }
    public string Estado { get; set; } = "PENDIENTE";
}
