using Clinica.Api.Shared.Abstractions;
using AjusteEntity = Clinica.Api.Modules.Almacenes.AjusteInventario.Entity.AjusteInventario;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Entity;

public sealed class AjusteInventarioDetalle : AuditableEntity
{
    public int AjusteInventarioId { get; set; }

    public AjusteEntity AjusteInventario { get; set; } = null!;

    public int ProductoId { get; set; }

    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }

    public LoteEntity? Lote { get; set; }

    public decimal Cantidad { get; set; }
}