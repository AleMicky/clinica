using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Compras.Domain.Entities;

public class Proveedor : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Nit { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public bool Activo { get; set; } = true;
    public ICollection<OrdenCompra> Ordenes { get; set; } = [];
}
