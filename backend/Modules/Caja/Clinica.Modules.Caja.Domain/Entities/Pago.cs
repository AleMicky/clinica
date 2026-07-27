using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class Pago : AuditableEntity
{
    /// <summary>Vínculo directo legacy; la aplicación formal va por AplicacionPago.</summary>
    public Guid CuentaId { get; set; }
    public Cuenta Cuenta { get; set; } = null!;

    public string Numero { get; set; } = string.Empty;
    public Guid PacienteId { get; set; }
    public Guid? TurnoCajaId { get; set; }
    public TurnoCaja? TurnoCaja { get; set; }
    public DateTime FechaPago { get; set; }
    public decimal Monto { get; set; }

    /// <summary>Legacy: método único. Los pagos nuevos usan Detalles.</summary>
    public string? MetodoPago { get; set; }

    public string Estado { get; set; } = PagoEstados.Confirmado;
    public string? Observaciones { get; set; }

    public ICollection<PagoDetalle> Detalles { get; set; } = [];
    public ICollection<AplicacionPago> Aplicaciones { get; set; } = [];
    public ICollection<MovimientoCaja> Movimientos { get; set; } = [];
    public Recibo? Recibo { get; set; }
}

public static class PagoEstados
{
    public const string Confirmado = "CONFIRMADO";
    public const string Anulado = "ANULADO";
    public const string Devuelto = "DEVUELTO";
    public const string ParcialmenteDevuelto = "PARCIALMENTE_DEVUELTO";
}
