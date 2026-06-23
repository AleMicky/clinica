using Clinica.Modules.Seguridad.Application.Roles;

namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IRoleService
{
    Task<RoleResponse> CreateAsync(
        CreateRoleRequest request,
        CancellationToken cancellationToken = default);

    Task<RoleResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RoleResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<RoleResponse> UpdateAsync(
        Guid id,
        UpdateRoleRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
