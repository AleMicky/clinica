using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class FormularioSeccion : AuditableEntity
{
    public Guid FormularioClinicoId { get; set; }
    public FormularioClinico FormularioClinico { get; set; } = null!;

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int Orden { get; set; }
    public bool Visible { get; set; } = true;

    /// <summary>
    /// Etapa del flujo clínico a la que pertenece la sección (RECEPCION, ENFERMERIA, CONSULTA_MEDICA, etc.).
    /// </summary>
    public string? EtapaFlujo { get; set; }
    
    public ICollection<FormularioCampo> Campos { get; set; } = [];
}