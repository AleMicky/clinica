using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class Producto : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public Guid CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;
    public Guid UnidadMedidaId { get; set; }
    public decimal StockMinimo { get; set; }
    public bool ControlaLote { get; set; } = true;
    public bool ControlaVencimiento { get; set; } = true;
    public bool EsMedicamento { get; set; }
    public bool Activo { get; set; } = true;
    public ICollection<Lote> Lotes { get; set; } = [];
    public ICollection<Existencia> Existencias { get; set; } = [];
}
