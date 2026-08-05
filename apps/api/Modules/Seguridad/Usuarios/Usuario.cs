using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

public class Usuario : IdentityUser<int>
{
    public int PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;
    public bool Activo { get; set; } = true;
    public bool DebeCambiarPassword { get; set; }
}