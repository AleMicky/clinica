using Clinica.Api.Modules.Almacenes.MovimientoInventario.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using TipoMovimientoEntity = Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity.TipoMovimientoInventario;


namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;

public sealed class MovimientoInventario : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int TipoMovimientoInventarioId { get; set; }
    public TipoMovimientoEntity TipoMovimientoInventario { get; set; } = null!;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public DateTime FechaMovimiento { get; set; }
    
    public EstadoMovimientoInventario Estado { get; set; } = EstadoMovimientoInventario.Borrador;

    public string? ReferenciaTipo { get; set; }
    public int? ReferenciaId { get; set; }

    public string? Observacion { get; set; }
    
    public DateTime? FechaConfirmacion { get; set; }
    public DateTime? FechaAnulacion { get; set; }

    public string? MotivoAnulacion { get; set; }

    public ICollection<MovimientoInventarioDetalle> Detalles { get; set; } = [];
}