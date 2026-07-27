using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class Cargo : AuditableEntity
{
    public Guid CuentaId { get; set; }
    public Cuenta Cuenta { get; set; } = null!;
    public string Concepto { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public decimal Cantidad { get; set; } = 1;
    public decimal MontoUnitario { get; set; }
    public decimal MontoTotal { get; set; }
    public string ModuloOrigen { get; set; } = string.Empty;
    public string EntidadOrigen { get; set; } = string.Empty;
    public Guid ReferenciaId { get; set; }
    public Guid? ReferenciaLineaId { get; set; }
}
