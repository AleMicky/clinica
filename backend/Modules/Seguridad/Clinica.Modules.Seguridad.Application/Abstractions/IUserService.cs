namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IUserService
{
    Task<Users.UserResponse> CreateAsync(Users.CreateUserRequest request, CancellationToken cancellationToken = default);
    Task AssignRoleAsync(Guid userId, Users.AssignRoleRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Users.UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);
}
