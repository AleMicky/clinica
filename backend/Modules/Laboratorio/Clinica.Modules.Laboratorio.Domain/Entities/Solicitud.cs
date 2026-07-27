using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class Solicitud : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid PacienteId { get; set; }
    public string Origen { get; set; } = string.Empty;
    public Guid? AtencionId { get; set; }
    public Guid? MedicoSolicitanteId { get; set; }
    public string? MedicoExternoNombre { get; set; }
    public string Estado { get; set; } = "BORRADOR";
    public Guid? WorkflowInstanceId { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaSolicitud { get; set; }
    public ICollection<SolicitudDetalle> Detalles { get; set; } = [];
    public ICollection<SolicitudPago> Pagos { get; set; } = [];
    public ICollection<Muestra> Muestras { get; set; } = [];
    public ICollection<Resultado> Resultados { get; set; } = [];
}
