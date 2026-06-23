using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string NombreCompleto { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
