using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class Atencion : AuditableEntity
{
    public string NumeroAtencion { get; set; } = string.Empty;
    public Guid PacienteId { get; set; }
    public Guid TipoAtencionId { get; set; }
    public TipoAtencion TipoAtencion { get; set; } = null!;

    public Guid? ServicioId { get; set; }
    public Guid? EspecialidadId { get; set; }
    public Guid? MedicoId { get; set; }
    public string? MotivoConsulta { get; set; }

    public Guid? FormularioClinicoId { get; set; }
    public FormularioClinico? FormularioClinico { get; set; }

    public DateTime FechaAtencion { get; set; }
    public DateTime? FechaRecepcion { get; set; }
    public string Estado { get; set; } = "BORRADOR";
    public Guid? WorkflowInstanceId { get; set; }
    public string? Observaciones { get; set; }

    public string? ResponsableFinancieroNombre { get; set; }
    public string? ResponsableFinancieroDocumento { get; set; }
    public string? ResponsableFinancieroTelefono { get; set; }
    public string? SeguroNombre { get; set; }
    public string? NumeroAfiliacion { get; set; }

    public ICollection<AtencionFormularioRespuesta> Respuestas { get; set; } = [];
}
