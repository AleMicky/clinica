using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;



public sealed class ArqueoCaja : AuditableEntity
{
    public int TurnoCajaId { get; set; }

    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public decimal TotalEsperado { get; set; }

    public decimal TotalContado { get; set; }

    public decimal Diferencia { get; set; }

    public string? Observacion { get; set; }

    public ICollection<DetalleArqueoCaja> Detalles { get; set; } = [];
}