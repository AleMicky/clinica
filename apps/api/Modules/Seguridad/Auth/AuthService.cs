using System.Security.Claims;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Modules.Seguridad.Usuarios;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Seguridad.Auth;

public sealed class AuthService(
    UserManager<Usuario> userManager,
    SignInManager<Usuario> signInManager,
    IJwtService jwtService)
{
    public async Task<LoginResponse> LoginAsync(
        LoginRequest request)
    {
        var usuario = await userManager.Users
                          .Include(x => x.Persona)
                          .FirstOrDefaultAsync(x => x.UserName == request.UserName)
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
            DateTime.UtcNow.AddMinutes(480),
            usuario.DebeCambiarPassword);
    }

    public async Task<MeResponse> MeAsync(
        ClaimsPrincipal principal)
    {
        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub")
            ?? principal.FindFirstValue(ClaimTypes.Name);

        var usuario = (userIdStr != null
                ? await userManager.Users
                    .Include(x => x.Persona)
                    .FirstOrDefaultAsync(x => x.Id.ToString() == userIdStr)
                : null)
            ?? await userManager.GetUserAsync(principal)
            ?? throw new UnauthorizedAccessException();

        var roles = await userManager.GetRolesAsync(usuario);

        var personaDto = usuario.Persona is null ? null : new PersonaPerfilDto
        {
            Id = usuario.Persona.Id,
            Nombres = usuario.Persona.Nombres,
            ApellidoPaterno = usuario.Persona.ApellidoPaterno,
            ApellidoMaterno = usuario.Persona.ApellidoMaterno,
            TipoDocumento = usuario.Persona.TipoDocumento,
            NumeroDocumento = usuario.Persona.NumeroDocumento,
            ExtensionDocumento = usuario.Persona.ExtensionDocumento,
            ComplementoDocumento = usuario.Persona.ComplementoDocumento,
            Telefono = usuario.Persona.Telefono,
            Direccion = usuario.Persona.Direccion,
            FechaNacimiento = usuario.Persona.FechaNacimiento,
            Genero = usuario.Persona.Genero,
            EstadoCivil = usuario.Persona.EstadoCivil
        };

        return new MeResponse
        {
            Id = usuario.Id,
            UserName = usuario.UserName ?? string.Empty,
            Email = usuario.Email ?? string.Empty,
            Nombres = usuario.Persona?.Nombres ?? string.Empty,
            ApellidoPaterno = usuario.Persona?.ApellidoPaterno ?? string.Empty,
            ApellidoMaterno = usuario.Persona?.ApellidoMaterno,
            NombreCompleto = ConstruirNombreCompleto(usuario.Persona),
            Activo = usuario.Activo,
            DebeCambiarPassword = usuario.DebeCambiarPassword,
            Roles = roles.ToList(),
            Persona = personaDto
        };
    }

    public async Task ChangePasswordAsync(
        ClaimsPrincipal principal,
        ChangePasswordRequest request)
    {
        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");

        var usuario = (userIdStr != null
                ? await userManager.FindByIdAsync(userIdStr)
                : null)
            ?? await userManager.GetUserAsync(principal)
            ?? throw new UnauthorizedAccessException();

        (await userManager.ChangePasswordAsync(
            usuario,
            request.CurrentPassword,
            request.NewPassword))
            .EnsureSuccess();

        if (usuario.DebeCambiarPassword)
        {
            usuario.DebeCambiarPassword = false;
            (await userManager.UpdateAsync(usuario))
                .EnsureSuccess();
        }
    }

    public async Task<LogoutResponse> LogoutAsync()
    {
        await signInManager.SignOutAsync();
        return new LogoutResponse("Sesión cerrada exitosamente.");
    }

    public async Task<RefreshTokenResponse> RefreshAsync(
        ClaimsPrincipal principal,
        RefreshTokenRequest request)
    {
        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");

        var usuario = (userIdStr != null
                ? await userManager.FindByIdAsync(userIdStr)
                : null)
            ?? await userManager.GetUserAsync(principal)
            ?? throw new UnauthorizedAccessException();

        if (!usuario.Activo)
        {
            throw new BusinessException("El usuario se encuentra inactivo.");
        }

        var token = await jwtService.GenerateTokenAsync(usuario);

        return new RefreshTokenResponse(
            token,
            DateTime.UtcNow.AddMinutes(480));
    }

    private static string ConstruirNombreCompleto(Persona? persona)
    {
        if (persona is null)
            return string.Empty;

        return string.Join(" ",
            new[] { persona.Nombres, persona.ApellidoPaterno, persona.ApellidoMaterno }
                .Where(x => !string.IsNullOrWhiteSpace(x)));
    }
}