using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Ventas.Venta.Entity;

public sealed class VentaDetalle : AuditableEntity
{
    public int VentaId { get; set; }
    public Venta Venta { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public int? MedicoId { get; set; }
    public Medico? Medico { get; set; }

    public decimal Cantidad { get; set; } = 1m;
    public decimal PrecioUnitario { get; set; }
    public decimal Descuento { get; set; }
    public decimal Total { get; set; }
    public decimal? MontoMedico { get; set; }
    public decimal? MontoClinica { get; set; }
}