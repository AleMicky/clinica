using System.Security.Claims;

namespace Clinica.Api.Shared.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal user)
    {
        var usuarioId =
            user.FindFirstValue("sub")
            ?? user.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(usuarioId))
        {
            throw new UnauthorizedAccessException("No fue posible determinar el usuario autenticado.");
        }

        return usuarioId;
    }
}