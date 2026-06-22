namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IRoleService
{
    Task<Roles.RoleResponse> CreateAsync(Roles.CreateRoleRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Roles.RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default);
}
