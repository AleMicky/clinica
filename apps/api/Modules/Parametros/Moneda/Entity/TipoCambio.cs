using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Moneda.Entity;

public sealed class TipoCambio : AuditableEntity
{
    public int MonedaOrigenId { get; set; }
    public Moneda MonedaOrigen { get; set; } = null!;

    public int MonedaDestinoId { get; set; }
    public Moneda MonedaDestino { get; set; } = null!;

    public decimal Compra { get; set; }
    public decimal Venta { get; set; }

    public DateOnly Fecha { get; set; }
}