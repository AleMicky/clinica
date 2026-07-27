using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class MovimientoCaja : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid TurnoCajaId { get; set; }
    public TurnoCaja TurnoCaja { get; set; } = null!;
    public Guid ConceptoCajaId { get; set; }
    public ConceptoCaja ConceptoCaja { get; set; } = null!;
    public string TipoMovimiento { get; set; } = TipoMovimientoCaja.Ingreso;
    public DateTime Fecha { get; set; }
    public decimal Importe { get; set; }
    public Guid? MetodoPagoId { get; set; }
    public MetodoPago? MetodoPago { get; set; }
    public Guid? PagoId { get; set; }
    public Pago? Pago { get; set; }
    public string? ModuloOrigen { get; set; }
    public Guid? ReferenciaId { get; set; }
    public string? Descripcion { get; set; }
    public string Estado { get; set; } = MovimientoCajaEstados.Confirmado;
}

public static class MovimientoCajaEstados
{
    public const string Confirmado = "CONFIRMADO";
    public const string Anulado = "ANULADO";
    public const string Reversado = "REVERSADO";
}
