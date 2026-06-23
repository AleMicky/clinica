using Clinica.Modules.Seguridad.Application.Roles;

namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IRoleService
{
    Task<RoleResponse> CreateAsync(
        CreateRoleRequest request,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default);
}