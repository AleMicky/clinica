using Clinica.Api.Modules.Compras.SolicitudCompra.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Entity;

using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;

public sealed class SolicitudCompra : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaRequerida { get; set; }
    public EstadoSolicitudCompra Estado { get; set; } = EstadoSolicitudCompra.Borrador;
    public string? Observacion { get; set; }
    public string? SolicitadoPorId { get; set; }
    public string? AprobadoPorId { get; set; }
    public DateTime? FechaAprobacion { get; set; }
    public string? ObservacionAprobacion { get; set; }
    public ICollection<SolicitudCompraDetalle> Detalles { get; set; } = [];
}