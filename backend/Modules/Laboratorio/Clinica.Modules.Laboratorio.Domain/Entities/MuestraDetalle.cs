using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class MuestraDetalle : AuditableEntity
{
    public Guid MuestraId { get; set; }
    public Muestra Muestra { get; set; } = null!;
    public Guid SolicitudDetalleId { get; set; }
    public SolicitudDetalle SolicitudDetalle { get; set; } = null!;
    public string Estado { get; set; } = "TOMADA";
}
