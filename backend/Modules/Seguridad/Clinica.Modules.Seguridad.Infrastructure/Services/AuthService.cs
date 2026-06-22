using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Auth;
using Clinica.Modules.Seguridad.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByNameAsync(request.UserName)
            ?? await _userManager.FindByEmailAsync(request.UserName);

        if (user is null || !user.Activo)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user, roles);

        return new LoginResponse(
            token,
            DateTime.UtcNow.AddHours(8),
            user.Id,
            user.UserName ?? string.Empty,
            user.NombreCompleto,
            roles.ToList());
    }
}
