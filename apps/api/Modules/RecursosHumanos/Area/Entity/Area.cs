using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Entity;

public sealed class Area : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int Orden { get; set; }

    public int TipoAreaId { get; set; }
    public TipoArea.Entity.TipoArea TipoArea { get; set; } = null!;

    public int? AreaPadreId { get; set; }
    public Area? AreaPadre { get; set; }

    public ICollection<Area> Subareas { get; set; } = [];

    public ICollection<AsignacionEmpleado.Entity.AsignacionEmpleado> Asignaciones { get; set; } = [];
}