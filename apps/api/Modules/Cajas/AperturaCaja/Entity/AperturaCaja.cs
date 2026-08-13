using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.AperturaCaja.Entity;

public sealed class AperturaCaja : AuditableEntity
{
    public int TurnoCajaId { get; set; }
    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public decimal MontoInicial { get; set; }

    public string? Observacion { get; set; }
}