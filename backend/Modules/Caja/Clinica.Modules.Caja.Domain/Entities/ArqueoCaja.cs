using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class ArqueoCaja : AuditableEntity
{
    public Guid TurnoCajaId { get; set; }
    public TurnoCaja TurnoCaja { get; set; } = null!;
    public DateTime Fecha { get; set; }
    public decimal MontoInicial { get; set; }
    public decimal IngresosEfectivo { get; set; }
    public decimal EgresosEfectivo { get; set; }
    public decimal MontoEsperado { get; set; }
    public decimal MontoContado { get; set; }
    public decimal Diferencia { get; set; }
    public string? Observaciones { get; set; }
    public Guid RealizadoPor { get; set; }
}
