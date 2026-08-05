using Microsoft.AspNetCore.Identity;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

public class Usuario : IdentityUser<int>
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}