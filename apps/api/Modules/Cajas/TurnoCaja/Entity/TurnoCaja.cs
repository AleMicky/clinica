using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Entity;

public sealed class TurnoCaja : AuditableEntity
{
    public int CajaId { get; set; }
    public Caja.Entity.Caja Caja { get; set; } = null!;

    public int EmpleadoId { get; set; }
    public Empleado Empleado { get; set; } = null!;

    public DateTime FechaHoraApertura { get; set; }
    public DateTime? FechaHoraCierre { get; set; }

    public EstadoTurnoCaja Estado { get; set; }
    
    public ICollection<Cobro.Entity.Cobro> Cobros { get; set; } = [];
    public ICollection<MovimientoCaja.Entity.MovimientoCaja> Movimientos { get; set; } = [];
    public ICollection<ArqueoCaja.Entity.ArqueoCaja> Arqueos { get; set; } = [];
}