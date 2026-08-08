using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Convenios.Entity;

public sealed class Convenio : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public ICollection<ConvenioTarifario> Tarifarios { get; set; } = [];
}