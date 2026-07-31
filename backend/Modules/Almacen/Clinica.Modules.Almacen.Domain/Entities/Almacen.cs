using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class Almacen : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }

    public Guid TipoAlmacenId { get; set; }
    public TipoAlmacen TipoAlmacen { get; set; } = null!;

    public Guid? ResponsableEmpleadoId { get; set; }

    public bool PermiteVenta { get; set; }
    public bool PermiteDispensacion { get; set; }
    public bool PermiteStockNegativo { get; set; }

    public ICollection<ProductoStock> Stocks { get; set; } = [];
    public ICollection<ProductoLote> Lotes { get; set; } = [];
}