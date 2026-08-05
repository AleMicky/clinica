using Microsoft.AspNetCore.Identity;

namespace Clinica.Api.Modules.Seguridad.Roles;

public class Rol : IdentityRole<int>
{
    public string? Descripcion { get; set; }
}