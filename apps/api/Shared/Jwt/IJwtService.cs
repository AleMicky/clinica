using Clinica.Api.Modules.Seguridad.Usuarios;

namespace Clinica.Api.Shared.Jwt;

public interface IJwtService
{
    Task<string> GenerateTokenAsync(Usuario usuario);
}