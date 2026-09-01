using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;


namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity;

public sealed class TransferenciaAlmacen : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenOrigenId { get; set; }
    public AlmacenEntity AlmacenOrigen { get; set; } = null!;

    public int AlmacenDestinoId { get; set; }
    public AlmacenEntity AlmacenDestino { get; set; } = null!;

    public DateTime FechaSolicitud { get; set; }

    public DateTime? FechaAprobacion { get; set; }
    public DateTime? FechaDespacho { get; set; }
    public DateTime? FechaRecepcion { get; set; }

    public int? SolicitadoPorId { get; set; }
    public int? AprobadoPorId { get; set; }
    public int? DespachadoPorId { get; set; }
    public int? RecibidoPorId { get; set; }

    public string? Observacion { get; set; }

    public EstadoTransferenciaAlmacen Estado { get; set; } = EstadoTransferenciaAlmacen.Borrador;

    public ICollection<TransferenciaAlmacenDetalle> Detalles { get; set; } = [];
}