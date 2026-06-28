using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class Atencion : AuditableEntity
{
    public string NumeroTramite { get; set; } = string.Empty;
    public Guid PacienteId { get; set; }

    public Guid TipoAtencionId { get; set; }
    public TipoAtencion TipoAtencion { get; set; } = null!;
    
    public Guid FormularioClinicoId { get; set; }
    public FormularioClinico FormularioClinico { get; set; } = null!;

    public DateTime FechaAtencion { get; set; }
    public string Estado { get; set; } = "BORRADOR";
    public string? Observaciones { get; set; }

    public ICollection<AtencionFormularioRespuesta> Respuestas { get; set; } = [];
    
    // Datos clínicos
    public ICollection<SignoVital> SignosVitales { get; set; } = [];
    public ICollection<DiagnosticoAtencion> Diagnosticos { get; set; } = [];
    public ICollection<Tratamiento> Tratamientos { get; set; } = [];
    public ICollection<Estudio> Estudios { get; set; } = [];
    public ICollection<Interconsulta> Interconsultas { get; set; } = [];
    public ICollection<Prescripcion> Prescripciones { get; set; } = [];
}