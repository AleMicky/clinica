using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Ventas.Venta.Entity;

public sealed class VentaPagador : AuditableEntity
{
    public int VentaId { get; set; }
    public Venta Venta { get; set; } = null!;

    public TipoPagador Tipo { get; set; }

    public int? ConvenioId { get; set; }
    public Convenio? Convenio { get; set; }

    public decimal Monto { get; set; }

    public EstadoVentaPagador Estado { get; set; }
}