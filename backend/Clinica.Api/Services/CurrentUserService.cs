using System.Security.Claims;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Api.Services;

public sealed class CurrentUserService : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var value = _httpContextAccessor
                .HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(value, out var userId)
                ? userId
                : null;
        }
    }

    public string? UserName =>
        _httpContextAccessor
            .HttpContext?
            .User
            .Identity?
            .Name;

    public IReadOnlyCollection<string> Roles =>
        _httpContextAccessor
            .HttpContext?
            .User
            .FindAll(ClaimTypes.Role)
            .Select(x => x.Value)
            .ToList()
        ?? [];

    public bool IsAuthenticated =>
        _httpContextAccessor
            .HttpContext?
            .User
            .Identity?
            .IsAuthenticated
        ?? false;
}