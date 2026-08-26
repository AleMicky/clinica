using System.Security.Claims;

namespace Clinica.Api.Shared.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(
                        ClaimTypes.NameIdentifier)
                    ?? user.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new UnauthorizedAccessException("No se pudo determinar el usuario autenticado.");
        }

        if (!int.TryParse(value, out var usuarioId))
        {
            throw new UnauthorizedAccessException("El identificador del usuario no es válido.");
        }

        return usuarioId;
    }
}