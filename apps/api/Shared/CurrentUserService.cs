using System.Security.Claims;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Shared;

public sealed class CurrentUserService(IHttpContextAccessor accessor)
    : ICurrentUserService
{
    private ClaimsPrincipal? User =>
        accessor.HttpContext?.User;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated == true;

    public int? UserId
    {
        get
        {
            var value = User?.FindFirstValue(
                ClaimTypes.NameIdentifier);

            return int.TryParse(value, out var id)
                ? id
                : null;
        }
    }

    public string? UserName
    {
        get
        {
            if (!IsAuthenticated)
                return null;

            return User?.FindFirstValue(ClaimTypes.Name)
                   ?? User?.FindFirstValue("unique_name")
                   ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }

    public bool IsInRole(string role)
    {
        return User?.IsInRole(role) == true;
    }
}