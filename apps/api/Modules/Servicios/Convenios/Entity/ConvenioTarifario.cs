using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Convenios.Entity;

public class ConvenioTarifario : AuditableEntity
{
    public int ConvenioId { get; set; }
    public Convenio Convenio { get; set; } = null!;

    public int TarifarioId { get; set; }
    public Tarifario Tarifario { get; set; } = null!;

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
}