using Clinica.Api.Shared.Abstractions;
using ConsumoEntity = Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity.ConsumoInterno;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity;

public sealed class ConsumoInternoDetalle : AuditableEntity
{
    public int ConsumoInternoId { get; set; }
    public ConsumoEntity ConsumoInterno { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal Cantidad { get; set; }
}