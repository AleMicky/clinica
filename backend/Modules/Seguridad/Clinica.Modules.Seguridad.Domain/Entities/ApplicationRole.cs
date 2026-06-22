using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Domain.Entities;

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Descripcion { get; set; }
}
