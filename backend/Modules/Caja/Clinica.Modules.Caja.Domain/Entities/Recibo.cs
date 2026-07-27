using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class Recibo : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid PagoId { get; set; }
    public Pago Pago { get; set; } = null!;
    public Guid PacienteId { get; set; }
    public DateTime FechaEmision { get; set; }
    public decimal Importe { get; set; }
    public string Estado { get; set; } = ReciboEstados.Emitido;
    public string? Observaciones { get; set; }
}

public static class ReciboEstados
{
    public const string Emitido = "EMITIDO";
    public const string Anulado = "ANULADO";
}
