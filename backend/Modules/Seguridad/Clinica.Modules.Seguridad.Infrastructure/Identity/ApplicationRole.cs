using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Infrastructure.Identity;

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Descripcion { get; set; }
}
