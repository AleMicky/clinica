using Clinica.Api.Shared.Abstractions;
using BajaEntity = Clinica.Api.Modules.Almacenes.BajaInventario.Entity.BajaInventario;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Entity;

public sealed class BajaInventarioDetalle : AuditableEntity
{
    public int BajaInventarioId { get; set; }
    public BajaEntity BajaInventario { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal Cantidad { get; set; }

    public string? Observacion { get; set; }
}