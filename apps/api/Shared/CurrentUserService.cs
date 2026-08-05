using System.Security.Claims;
using Clinica.Api.Shared.Abstractions;
using Microsoft.AspNetCore.Http;

namespace Clinica.Api.Shared;

public sealed class CurrentUserService(IHttpContextAccessor accessor)
    : ICurrentUserService
{
    public string? UserName
    {
        get
        {
            var user = accessor.HttpContext?.User;

            if (user?.Identity?.IsAuthenticated != true)
                return null;

            return user.FindFirstValue(ClaimTypes.Name)
                ?? user.FindFirstValue("unique_name")
                ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }
}