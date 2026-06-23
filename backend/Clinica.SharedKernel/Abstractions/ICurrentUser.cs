namespace Clinica.SharedKernel.Abstractions;

public interface ICurrentUser
{
    Guid? UserId { get; }
    string? UserName { get; }
    IReadOnlyCollection<string> Roles { get; }
    bool IsAuthenticated { get; }
}