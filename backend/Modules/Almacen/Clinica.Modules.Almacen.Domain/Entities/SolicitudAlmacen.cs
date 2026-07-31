using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class SolicitudAlmacen : AuditableEntity
{
    public string Numero { get; set; } = null!;
    public DateTime FechaSolicitud { get; set; }

    public Guid AreaSolicitanteId { get; set; }
    public Guid EmpleadoSolicitanteId { get; set; }

    public Guid AlmacenId { get; set; }
    public Almacen Almacen { get; set; } = null!;

    public EstadoSolicitudAlmacen Estado { get; set; }

    public string? Observacion { get; set; }

    public ICollection<SolicitudAlmacenDetalle> Detalles { get; set; } = [];
}