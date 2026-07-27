using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Compras.Domain.Entities;

public class OrdenCompra : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid ProveedorId { get; set; }
    public Proveedor Proveedor { get; set; } = null!;
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = OrdenCompraEstados.Borrador;
    public string? Observaciones { get; set; }
    public ICollection<OrdenCompraDetalle> Detalles { get; set; } = [];
}

public static class OrdenCompraEstados
{
    public const string Borrador = "BORRADOR";
    public const string Confirmada = "CONFIRMADA";
    public const string Parcial = "PARCIAL";
    public const string Recibida = "RECIBIDA";
    public const string Anulada = "ANULADA";
}
