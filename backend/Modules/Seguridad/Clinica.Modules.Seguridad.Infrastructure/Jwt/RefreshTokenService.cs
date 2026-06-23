using System.Security.Cryptography;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Clinica.Modules.Seguridad.Infrastructure.Jwt;

public sealed class RefreshTokenService(
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration)
{
    public const string LoginProvider = "Clinica";
    public const string TokenName = "RefreshToken";

    public async Task<(string Token, DateTime ExpiresAt)> GenerateAsync(ApplicationUser user)
    {
        var randomPart = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var expiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenExpiresInDays());
        var storedValue = $"{randomPart}|{expiresAt:O}";

        await userManager.SetAuthenticationTokenAsync(
            user,
            LoginProvider,
            TokenName,
            storedValue);

        return ($"{user.Id}.{randomPart}", expiresAt);
    }

    public async Task<ApplicationUser?> ValidateAsync(string refreshToken)
    {
        var separatorIndex = refreshToken.IndexOf('.');

        if (separatorIndex <= 0 || separatorIndex >= refreshToken.Length - 1)
            return null;

        if (!Guid.TryParse(refreshToken[..separatorIndex], out var userId))
            return null;

        var randomPart = refreshToken[(separatorIndex + 1)..];
        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null)
            return null;

        var storedValue = await userManager.GetAuthenticationTokenAsync(
            user,
            LoginProvider,
            TokenName);

        if (string.IsNullOrWhiteSpace(storedValue))
            return null;

        var parts = storedValue.Split('|', 2);

        if (parts.Length != 2)
            return null;

        if (!string.Equals(parts[0], randomPart, StringComparison.Ordinal))
            return null;

        if (!DateTime.TryParse(parts[1], null, System.Globalization.DateTimeStyles.RoundtripKind, out var expiresAt))
            return null;

        if (expiresAt <= DateTime.UtcNow)
            return null;

        return user;
    }

    public Task RevokeAsync(ApplicationUser user) =>
        userManager.RemoveAuthenticationTokenAsync(user, LoginProvider, TokenName);

    private int GetRefreshTokenExpiresInDays() =>
        configuration.GetSection("Jwt").GetValue<int?>("RefreshTokenExpiresInDays") ?? 7;
}
