using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class TipoAtencion : AuditableEntity, INamedCatalogEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Color { get; set; } = "#1677ff";
    public string? Icono { get; set; }

    public ICollection<FormularioClinico> FormulariosClinicos { get; set; } = [];
    public ICollection<Atencion> Atenciones { get; set; } = [];
}