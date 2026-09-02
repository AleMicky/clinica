using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.Proveedor.Entity;

public sealed class Proveedor : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
    public string? NombreComercial { get; set; }
    public string? Nit { get; set; }
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string? Celular { get; set; }
    public string? Email { get; set; }
    public string? Contacto { get; set; }
    public string? Observacion { get; set; }

    public ICollection<OrdenCompra.Entity.OrdenCompra> OrdenesCompra { get; set; } = [];

    public ICollection<CotizacionCompra.Entity.CotizacionCompra> Cotizaciones { get; set; } = [];

     public ICollection<RecepcionCompra.Entity.RecepcionCompra> Recepciones { get; set; } = [];
}