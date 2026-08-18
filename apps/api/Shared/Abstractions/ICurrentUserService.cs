namespace Clinica.Api.Shared.Abstractions;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? UserName { get; }
    bool IsAuthenticated { get; }

    bool IsInRole(string role);
}