using Clinica.Api.Shared.Abstractions;
using InventarioEntity = Clinica.Api.Modules.Almacenes.InventarioFisico.Entity.InventarioFisico;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Entity;

public sealed class InventarioFisicoDetalle : AuditableEntity
{
    public int InventarioFisicoId { get; set; }
    public InventarioEntity InventarioFisico { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal CantidadSistema { get; set; }

    public decimal? CantidadContada { get; set; }

    public decimal Diferencia => (CantidadContada ?? 0) - CantidadSistema;
}