using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;

public class OpcionMenu : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Ruta { get; set; }
    public string? Icono { get; set; }
    
    public int? PadreId { get; set; }
    public OpcionMenu? Padre { get; set; }

    public int Orden { get; set; }
    public ICollection<OpcionMenu> Hijos { get; set; } = new List<OpcionMenu>();

    public ICollection<RolOpcionMenu> Roles { get; set; } = new List<RolOpcionMenu>();
}