using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Admision.Entity;

public sealed class AdmisionDetalle : AuditableEntity
{
    public int AdmisionId { get; set; }
    public Admision Admision { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public int? MedicoId { get; set; }
    public Medico? Medico { get; set; }

    public decimal Cantidad { get; set; } = 1;

    public decimal PrecioUnitario { get; set; }

    public decimal Descuento { get; set; }

    public decimal Total { get; set; }
}