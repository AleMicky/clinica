using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class Prueba : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public Guid EspecialidadId { get; set; }
    public Especialidad Especialidad { get; set; } = null!;
    public Guid TipoExamenId { get; set; }
    public TipoExamen TipoExamen { get; set; } = null!;
    public Guid TipoMuestraId { get; set; }
    public CatalogoItem TipoMuestra { get; set; } = null!;
    public bool RequiereAyuno { get; set; }
    public int HorasAyuno { get; set; }
    public bool EsDerivable { get; set; }
}
