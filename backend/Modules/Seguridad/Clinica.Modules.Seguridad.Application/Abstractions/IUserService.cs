using Clinica.Modules.Seguridad.Application.Users;

namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IUserService
{
    Task<UserResponse> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default);

    Task<UserResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UserResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<UserResponse> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AssignRoleAsync(
        Guid userId,
        AssignRoleRequest request,
        CancellationToken cancellationToken = default);

    Task RemoveRoleAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);
}
