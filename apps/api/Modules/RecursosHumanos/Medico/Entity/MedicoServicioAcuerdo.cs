using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Entity;

public class MedicoServicioAcuerdo : AuditableEntity
{
    public int MedicoId { get; set; }
    public Medico Medico { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public decimal PorcentajeMedico { get; set; }

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
}