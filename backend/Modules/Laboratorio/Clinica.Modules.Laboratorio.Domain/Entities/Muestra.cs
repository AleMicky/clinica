using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class Muestra : AuditableEntity
{
    public Guid SolicitudId { get; set; }
    public Solicitud Solicitud { get; set; } = null!;
    public string Codigo { get; set; } = string.Empty;
    public Guid? TipoMuestraId { get; set; }
    public CatalogoItem? TipoMuestra { get; set; }
    public DateTime FechaToma { get; set; }
    public Guid? TomadoPorEmpleadoId { get; set; }
    public string Estado { get; set; } = "TOMADA";
    public string? Observaciones { get; set; }
    public ICollection<MuestraDetalle> Detalles { get; set; } = [];
}
