using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class Resultado : AuditableEntity
{
    public Guid SolicitudId { get; set; }
    public Solicitud Solicitud { get; set; } = null!;
    public Guid? MuestraId { get; set; }
    public Muestra? Muestra { get; set; }
    public string Estado { get; set; } = "REGISTRADO";
    public Guid? ValidadoPorEmpleadoId { get; set; }
    public DateTime? FechaValidacion { get; set; }
    public string? Observaciones { get; set; }
    public ICollection<ResultadoDetalle> Detalles { get; set; } = [];
}
