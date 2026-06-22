using Clinica.Modules.Seguridad.Domain.Entities;

namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IJwtTokenService
{
    string GenerateToken(ApplicationUser user, IEnumerable<string> roles);
}
