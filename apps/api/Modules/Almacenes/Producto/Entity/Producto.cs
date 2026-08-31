using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Clinica.Api.Shared.Abstractions;

using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
 
namespace Clinica.Api.Modules.Almacenes.Producto.Entity;

public sealed class Producto : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public int CategoriaProductoId { get; set; }
    public CategoriaProductoEntity CategoriaProducto { get; set; } = null!;

    public int UnidadMedidaId { get; set; }
    public UnidadesMedida UnidadMedida { get; set; } = null!;

    public bool ControlaLote { get; set; } = false;
    public bool ControlaVencimiento { get; set; } = false;

    public decimal StockMinimo { get; set; } = 0;
    public decimal? StockMaximo { get; set; }
}