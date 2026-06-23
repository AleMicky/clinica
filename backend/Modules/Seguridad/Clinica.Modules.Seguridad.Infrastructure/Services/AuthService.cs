using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Auth;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.Modules.Seguridad.Infrastructure.Jwt;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    JwtTokenGenerator jwtTokenGenerator,
    RefreshTokenService refreshTokenService,
    IUserService userService,
    ICurrentUser currentUser,
    IConfiguration configuration,
    IWebHostEnvironment environment,
    ILogger<AuthService> logger
) : IAuthService
{
    private const string ForgotPasswordMessage =
        "Si el usuario existe, recibirá instrucciones para restablecer la contraseña.";

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByNameAsync(request.UserName);

        if (user is null)
            throw new UnauthorizedAccessException("Usuario o contraseña incorrectos.");

        if (!user.Activo)
            throw new UnauthorizedAccessException("La cuenta de usuario está desactivada.");

        var valid = await userManager.CheckPasswordAsync(user, request.Password);

        if (!valid)
            throw new UnauthorizedAccessException("Usuario o contraseña incorrectos.");

        return await BuildLoginResponseAsync(user);
    }

    public async Task<LoginResponse> RefreshTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await refreshTokenService.ValidateAsync(request.RefreshToken);

        if (user is null || !user.Activo)
            throw new UnauthorizedAccessException("Refresh token inválido o expirado.");

        return await BuildLoginResponseAsync(user);
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        var user = await GetCurrentUserAsync();

        await refreshTokenService.RevokeAsync(user);
    }

    public async Task<UserResponse> GetMeAsync(CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();

        return await userService.GetByIdAsync(userId, cancellationToken);
    }

    public async Task ChangePasswordAsync(
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await GetCurrentUserAsync();

        var result = await userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));

        await refreshTokenService.RevokeAsync(user);
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await FindByEmailOrUserNameAsync(request.EmailOrUserName, cancellationToken);

        if (user is null)
            return new ForgotPasswordResponse(ForgotPasswordMessage);

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        logger.LogInformation(
            "Token de restablecimiento generado para el usuario {UserName}",
            user.UserName);

        if (environment.IsDevelopment())
        {
            logger.LogWarning(
                "Token de restablecimiento (solo desarrollo) para {UserName}: {Token}",
                user.UserName,
                token);

            return new ForgotPasswordResponse(ForgotPasswordMessage, token);
        }

        return new ForgotPasswordResponse(ForgotPasswordMessage);
    }

    public async Task ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await FindByEmailOrUserNameAsync(request.EmailOrUserName, cancellationToken);

        if (user is null)
            throw new BadRequestException("Token inválido o expirado.");

        var result = await userManager.ResetPasswordAsync(
            user,
            request.Token,
            request.NewPassword);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));

        await refreshTokenService.RevokeAsync(user);
    }

    private async Task<LoginResponse> BuildLoginResponseAsync(ApplicationUser user)
    {
        var token = await jwtTokenGenerator.GenerateAsync(user);
        var (refreshToken, refreshTokenExpiresAt) = await refreshTokenService.GenerateAsync(user);
        var roles = await userManager.GetRolesAsync(user);
        var expiresInHours = configuration.GetSection("Jwt").GetValue<int?>("ExpiresInHours") ?? 8;
        var expiresAt = DateTime.UtcNow.AddHours(expiresInHours);

        return new LoginResponse(
            token,
            expiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            user.Id,
            user.UserName ?? string.Empty,
            user.NombreCompleto,
            roles.ToList());
    }

    private async Task<ApplicationUser> GetCurrentUserAsync()
    {
        var userId = GetCurrentUserId();

        return await userManager.FindByIdAsync(userId.ToString())
               ?? throw new UnauthorizedAccessException("Usuario no autenticado.");
    }

    private Guid GetCurrentUserId()
    {
        return currentUser.UserId
               ?? throw new UnauthorizedAccessException("Usuario no autenticado.");
    }

    private async Task<ApplicationUser?> FindByEmailOrUserNameAsync(
        string emailOrUserName,
        CancellationToken cancellationToken)
    {
        var identifier = emailOrUserName.Trim();

        var user = await userManager.FindByNameAsync(identifier);

        if (user is not null)
            return user;

        return await userManager.Users
            .FirstOrDefaultAsync(x => x.Email == identifier, cancellationToken);
    }

    private static string GetIdentityErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(e => e.Description));
    }
}
