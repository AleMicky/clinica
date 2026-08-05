using System.Security.Claims;
using Clinica.Api.Modules.Seguridad.Usuarios;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Jwt;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Api.Modules.Seguridad.Auth;

public sealed class AuthService(
    UserManager<Usuario> userManager,
    SignInManager<Usuario> signInManager,
    IJwtService jwtService)
{
    public async Task<LoginResponse> LoginAsync(
        LoginRequest request)
    {
        var usuario = await userManager.FindByNameAsync(request.UserName)
            ?? throw new BusinessException(
                "Usuario o contraseña incorrectos.");

        if (!usuario.Activo)
        {
            throw new BusinessException(
                "El usuario se encuentra inactivo.");
        }

        var result = await signInManager.CheckPasswordSignInAsync(
            usuario,
            request.Password,
            false);

        if (!result.Succeeded)
        {
            throw new BusinessException(
                "Usuario o contraseña incorrectos.");
        }

        var token = await jwtService.GenerateTokenAsync(usuario);

        return new LoginResponse(
            token,
            DateTime.UtcNow.AddMinutes(480));
    }

    public async Task<MeResponse> MeAsync(
        ClaimsPrincipal principal)
    {
        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub")
            ?? principal.FindFirstValue(ClaimTypes.Name);

        var usuario = (userIdStr != null ? await userManager.FindByIdAsync(userIdStr) : null)
            ?? await userManager.GetUserAsync(principal)
            ?? throw new UnauthorizedAccessException();

        var roles = await userManager.GetRolesAsync(usuario);

        return new MeResponse
        {
            Id = usuario.Id,
            UserName = usuario.UserName ?? string.Empty,
            Email = usuario.Email ?? string.Empty,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Roles = roles.ToList()
        };
    }

    public async Task ChangePasswordAsync(
        ClaimsPrincipal principal,
        ChangePasswordRequest request)
    {
        var usuario = await userManager.GetUserAsync(principal)
            ?? throw new UnauthorizedAccessException();

        (await userManager.ChangePasswordAsync(
            usuario,
            request.CurrentPassword,
            request.NewPassword))
            .EnsureSuccess();
    }

    public Task LogoutAsync()
    {
        return Task.CompletedTask;
    }

    public Task<RefreshTokenResponse> RefreshAsync(
        RefreshTokenRequest request)
    {
        throw new NotImplementedException();
    }
}