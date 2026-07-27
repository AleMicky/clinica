using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class TurnoCaja : AuditableEntity
{
    public Guid CajaId { get; set; }
    public CajaFisica Caja { get; set; } = null!;
    public Guid UsuarioAperturaId { get; set; }
    public Guid? UsuarioCierreId { get; set; }
    public DateTime FechaApertura { get; set; }
    public DateTime? FechaCierre { get; set; }
    public decimal MontoInicial { get; set; }
    public decimal? MontoEsperado { get; set; }
    public decimal? MontoContado { get; set; }
    public decimal? Diferencia { get; set; }
    public string Estado { get; set; } = TurnoCajaEstados.Abierto;
    public string? ObservacionApertura { get; set; }
    public string? ObservacionCierre { get; set; }

    public ICollection<MovimientoCaja> Movimientos { get; set; } = [];
    public ICollection<Pago> Pagos { get; set; } = [];
    public ArqueoCaja? Arqueo { get; set; }
}

public static class TurnoCajaEstados
{
    public const string Abierto = "ABIERTO";
    public const string Cerrado = "CERRADO";
    public const string Anulado = "ANULADO";
}
