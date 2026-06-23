using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Clinica.Modules.Seguridad.Infrastructure.Jwt;

public sealed class JwtTokenGenerator(
    IConfiguration configuration,
    UserManager<ApplicationUser> userManager)
{
    public async Task<string> GenerateAsync(ApplicationUser user)
    {
        var jwt = configuration.GetSection("Jwt");
        var key = jwt["Key"] ?? throw new InvalidOperationException("JWT Key no está configurado.");
        var issuer = jwt["Issuer"] ?? throw new InvalidOperationException("JWT Issuer no está configurado.");
        var audience = jwt["Audience"] ?? throw new InvalidOperationException("JWT Audience no está configurado.");
        var expiresInHours = jwt.GetValue<int?>("ExpiresInHours") ?? 8;
        var roles = await userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName ?? string.Empty)
        };

        claims.AddRange(roles.Select(role =>
            new Claim(ClaimTypes.Role, role)));

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresInHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}