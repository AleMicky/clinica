using Clinica.Api.Modules.Almacenes.BajaInventario.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Entity;

using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using MovimientoEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;
public class BajaInventario: AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public TipoBajaInventario Tipo { get; set; }

    public DateTime Fecha { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public string? Observacion { get; set; }

    public EstadoBajaInventario Estado { get; set; } = EstadoBajaInventario.Borrador;

    public int? MovimientoInventarioId { get; set; }
    public MovimientoEntity? MovimientoInventario { get; set; }

    public DateTime? FechaConfirmacion { get; set; }

    public DateTime? FechaAnulacion { get; set; }

    public string? MotivoAnulacion { get; set; }

    public ICollection<BajaInventarioDetalle> Detalles { get; set; } = [];
}