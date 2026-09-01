using Clinica.Api.Modules.Almacenes.ConsumoInterno.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;
using MovimientoEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity;

public sealed class ConsumoInterno : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public int AreaId { get; set; }
    public AreaEntity Area { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public string? ReferenciaTipo { get; set; }
    public int? ReferenciaId { get; set; }

    public string? Observacion { get; set; }

    public EstadoConsumoInterno Estado { get; set; } = EstadoConsumoInterno.Borrador;

    public int? MovimientoInventarioId { get; set; }
    public MovimientoEntity? MovimientoInventario { get; set; }

    public ICollection<ConsumoInternoDetalle> Detalles { get; set; } = [];
}