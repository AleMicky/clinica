using Clinica.Api.Modules.Parametros.Banco.Entity;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.Cobro.Entity;

public sealed class CobroDetalle : AuditableEntity
{
    public int CobroId { get; set; }
    public Cobro Cobro { get; set; } = null!;

    public int MetodoPagoId { get; set; }
    public MetodoPago MetodoPago { get; set; } = null!;

    public int MonedaId { get; set; }
    public Moneda Moneda { get; set; } = null!;
    
    public int? CuentaBancariaId { get; set; }
    public CuentaBancaria? CuentaBancaria { get; set; }

    public decimal Monto { get; set; }

    public decimal TipoCambio { get; set; } = 1m;

    public decimal MontoMonedaBase { get; set; }

    public string? Referencia { get; set; }

    public string? EntidadFinanciera { get; set; }

    public string? Observacion { get; set; }
}