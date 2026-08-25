using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Shared.Abstractions;

using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;
using MovimientoCajaEntity = Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Entity;

public sealed class TurnoCaja : AuditableEntity
{
    public int CajaId { get; set; }
    public Caja.Entity.Caja Caja { get; set; } = null!;

    public int EmpleadoId { get; set; }
    public Empleado Empleado { get; set; } = null!;
    
    // APERTURA
    public DateTime FechaHoraApertura { get; set; }

    public decimal MontoInicial { get; set; }

    public string? ObservacionApertura { get; set; }

    // CIERRE
    public DateTime? FechaHoraCierre { get; set; }

    public string? ObservacionCierre { get; set; }
    public EstadoTurnoCaja Estado { get; set; }
     
    public ICollection<CobroEntity> Cobros { get; set; } = [];
    public ICollection<MovimientoCajaEntity> Movimientos { get; set; } = [];
    public ICollection<ArqueoCajaEntity> Arqueos { get; set; } = [];
}