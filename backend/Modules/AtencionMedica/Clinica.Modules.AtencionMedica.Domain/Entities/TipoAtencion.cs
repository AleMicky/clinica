using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class TipoAtencion : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<FormularioClinico> FormulariosClinicos { get; set; } = [];
    public ICollection<Atencion> Atenciones { get; set; } = [];
}