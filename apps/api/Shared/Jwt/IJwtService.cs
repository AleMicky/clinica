using Clinica.Api.Modules.Seguridad.Usuarios;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;

namespace Clinica.Api.Shared.Jwt;

public interface IJwtService
{
    Task<string> GenerateTokenAsync(Usuario usuario);
}