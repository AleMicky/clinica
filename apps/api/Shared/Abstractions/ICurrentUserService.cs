namespace Clinica.Api.Shared.Abstractions;

public interface ICurrentUserService
{
    string? UserName { get; }
}