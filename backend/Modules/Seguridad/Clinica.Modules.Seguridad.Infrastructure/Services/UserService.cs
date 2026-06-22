using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.Modules.Seguridad.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public UserService(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.UserName,
            Email = request.Email,
            NombreCompleto = request.NombreCompleto,
            EmailConfirmed = !string.IsNullOrWhiteSpace(request.Email)
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new ArgumentException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            await AssignRoleInternalAsync(user, request.Role);
        }

        var roles = await _userManager.GetRolesAsync(user);
        return MapToResponse(user, roles);
    }

    public async Task AssignRoleAsync(Guid userId, AssignRoleRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException($"Usuario con id '{userId}' no encontrado.");

        await AssignRoleInternalAsync(user, request.Role);
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = _userManager.Users.ToList();
        var responses = new List<UserResponse>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            responses.Add(MapToResponse(user, roles));
        }

        return responses;
    }

    private async Task AssignRoleInternalAsync(ApplicationUser user, string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            throw new ArgumentException($"El rol '{roleName}' no existe.");
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        if (!result.Succeeded)
        {
            throw new ArgumentException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }

    private static UserResponse MapToResponse(ApplicationUser user, IList<string> roles) =>
        new(user.Id, user.UserName ?? string.Empty, user.NombreCompleto, user.Email, user.Activo, roles.ToList());
}
