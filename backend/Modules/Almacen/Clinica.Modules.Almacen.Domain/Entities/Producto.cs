using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class Producto : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }

    public string? CodigoBarras { get; set; }

    public Guid CategoriaProductoId { get; set; }
    public CategoriaProducto CategoriaProducto { get; set; } = null!;

    public Guid UnidadMedidaId { get; set; }
    public UnidadMedida UnidadMedida { get; set; } = null!;

    public bool EsMedicamento { get; set; }

    public bool ManejaLote { get; set; }
    public bool ManejaVencimiento { get; set; }
    public bool ManejaSerie { get; set; }

    public decimal StockMinimo { get; set; }
    public decimal StockMaximo { get; set; }

    public bool Activo { get; set; } = true;

    public MedicamentoDetalle? MedicamentoDetalle { get; set; }

    public ICollection<ProductoStock> Stocks { get; set; } = [];
    public ICollection<ProductoLote> Lotes { get; set; } = [];
}