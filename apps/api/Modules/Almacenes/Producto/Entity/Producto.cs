using Clinica.Api.Modules.Compras.Proveedor.Entity;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Clinica.Api.Shared.Abstractions;

using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
using MarcaEntity = Clinica.Api.Modules.Almacenes.Marca.Entity.Marca;


namespace Clinica.Api.Modules.Almacenes.Producto.Entity;

public sealed class Producto : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public int CategoriaProductoId { get; set; }
    public CategoriaProductoEntity CategoriaProducto { get; set; } = null!;
    
    public int? MarcaId { get; set; }
    public MarcaEntity? Marca { get; set; }

    public int UnidadMedidaId { get; set; }
    public UnidadesMedida UnidadMedida { get; set; } = null!;
    
    public int? ProveedorId { get; set; }
    public Proveedor? Proveedor { get; set; }

    public bool ControlaLote { get; set; } = false;
    public bool ControlaVencimiento { get; set; } = false;

    public decimal StockMinimo { get; set; } = 0;
    public decimal? StockMaximo { get; set; }
}