using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Api.Modules.Seguridad.Roles.Entity;

public class Rol : IdentityRole<int>
{
    public string? Descripcion { get; set; }
    
    public ICollection<RolOpcionMenu> OpcionesMenu { get; set; } = new List<RolOpcionMenu>();
}