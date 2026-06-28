using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class FormularioClinico : AuditableEntity
{
    public Guid TipoAtencionId { get; set; }
    public TipoAtencion TipoAtencion { get; set; } = null!;
    
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int Version { get; set; } = 1;
    public bool Activo { get; set; } = true;

    public ICollection<FormularioSeccion> Secciones { get; set; } = [];
    public ICollection<Atencion> Atenciones { get; set; } = [];
}