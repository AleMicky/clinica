using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Tarifas.Entity;

public sealed class TarifarioDetalle : AuditableEntity
{
    public int TarifarioId { get; set; }
    public Tarifario Tarifario { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public decimal Precio { get; set; }
}