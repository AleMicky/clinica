using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;

public sealed class DetalleArqueoCaja : AuditableEntity
{
    public int ArqueoCajaId { get; set; }
    public ArqueoCaja ArqueoCaja { get; set; } = null!;

    public int MetodoPagoId { get; set; }
    public MetodoPago MetodoPago { get; set; } = null!;

    public int MonedaId { get; set; }
    public Moneda Moneda { get; set; } = null!;

    public decimal MontoEsperado { get; set; }

    public decimal MontoContado { get; set; }

    public decimal Diferencia { get; set; }
}