using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Clinica.Api.Modules.Seguridad.Usuarios;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Clinica.Api.Shared.Jwt;

public sealed class JwtService(
    UserManager<Usuario> userManager,
    IOptions<JwtOptions> options)
    : IJwtService
{
    private readonly JwtOptions _options = options.Value;

    public async Task<string> GenerateTokenAsync(
        Usuario usuario)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, usuario.UserName ?? string.Empty),
            new(JwtRegisteredClaimNames.Email, usuario.Email ?? string.Empty),

            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Name, usuario.UserName ?? string.Empty),
            new(ClaimTypes.Email, usuario.Email ?? string.Empty)
        };

        var roles = await userManager.GetRolesAsync(usuario);

        claims.AddRange(
            roles.Select(role =>
                new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_options.SecretKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                _options.ExpirationInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}