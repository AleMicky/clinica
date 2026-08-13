using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.CierreCaja.Entity;

public sealed class CierreCaja : AuditableEntity
{
    public int TurnoCajaId { get; set; }
    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public int ArqueoCajaId { get; set; }
    public ArqueoCaja.Entity.ArqueoCaja ArqueoCaja { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public decimal MontoApertura { get; set; }

    public decimal TotalIngresos { get; set; }
    public decimal TotalEgresos { get; set; }

    public decimal TotalCobros { get; set; }

    public decimal TotalEsperado { get; set; }
    public decimal TotalContado { get; set; }

    public decimal Diferencia { get; set; }

    public string? Observacion { get; set; }
}