using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Auth;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.Modules.Seguridad.Infrastructure.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    JwtTokenGenerator jwtTokenGenerator,
    IConfiguration configuration
) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByNameAsync(request.UserName);

        if (user is null)
            throw new UnauthorizedAccessException("Usuario o contraseña incorrectos.");

        if (!user.Activo)
            throw new UnauthorizedAccessException("La cuenta de usuario está desactivada.");

        var valid = await userManager.CheckPasswordAsync(user, request.Password);

        if (!valid)
            throw new UnauthorizedAccessException("Usuario o contraseña incorrectos.");

        var token = await jwtTokenGenerator.GenerateAsync(user);
        var roles = await userManager.GetRolesAsync(user);
        var expiresInHours = configuration.GetSection("Jwt").GetValue<int?>("ExpiresInHours") ?? 8;

        return new LoginResponse(
            token,
            DateTime.UtcNow.AddHours(expiresInHours),
            user.Id,
            user.UserName ?? string.Empty,
            user.NombreCompleto,
            roles.ToList()
        );
    }
}