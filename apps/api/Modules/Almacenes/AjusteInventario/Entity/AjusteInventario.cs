using Clinica.Api.Modules.Almacenes.AjusteInventario.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using MovimientoEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Entity;

public sealed class AjusteInventario : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public TipoAjusteInventario Tipo { get; set; }

    public DateTime Fecha { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public string? Observacion { get; set; }

    public EstadoAjusteInventario Estado { get; set; } = EstadoAjusteInventario.Borrador;

    // Movimiento generado al confirmar el ajuste.
    public int? MovimientoInventarioId { get; set; }

    public MovimientoEntity? MovimientoInventario { get; set; }

    public DateTime? FechaConfirmacion { get; set; }

    public DateTime? FechaAnulacion { get; set; }

    public string? MotivoAnulacion { get; set; }

    public ICollection<AjusteInventarioDetalle> Detalles { get; set; } = [];
}