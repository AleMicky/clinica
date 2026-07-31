using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class TransferenciaAlmacen : AuditableEntity
{
    public string Numero { get; set; } = null!;
    public DateTime FechaSolicitud { get; set; }

    public Guid AlmacenOrigenId { get; set; }
    public Almacen AlmacenOrigen { get; set; } = null!;

    public Guid AlmacenDestinoId { get; set; }
    public Almacen AlmacenDestino { get; set; } = null!;

    public Guid EmpleadoSolicitanteId { get; set; }

    public Guid? EmpleadoAprobadorId { get; set; }
    public Guid? EmpleadoDespachoId { get; set; }
    public Guid? EmpleadoRecepcionId { get; set; }

    public DateTime? FechaEnvio { get; set; }
    public DateTime? FechaRecepcion { get; set; }

    public EstadoTransferenciaAlmacen Estado { get; set; }

    public string? Observacion { get; set; }

    public ICollection<TransferenciaAlmacenDetalle> Detalles { get; set; } = [];
}