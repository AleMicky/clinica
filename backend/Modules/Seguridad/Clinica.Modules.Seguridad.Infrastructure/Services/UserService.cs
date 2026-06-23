using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public sealed class UserService(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager
) : IUserService
{
    public async Task<UserResponse> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var userNameExists = await userManager.Users
            .AnyAsync(x => x.UserName == request.UserName, cancellationToken);

        if (userNameExists)
            throw new BadRequestException($"El usuario '{request.UserName}' ya existe.");

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await userManager.Users
                .AnyAsync(x => x.Email == request.Email, cancellationToken);

            if (emailExists)
                throw new BadRequestException($"El correo '{request.Email}' ya está registrado.");
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.UserName.Trim(),
            Email = request.Email?.Trim(),
            NombreCompleto = request.NombreCompleto.Trim(),
            EmailConfirmed = !string.IsNullOrWhiteSpace(request.Email),
            Activo = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));

        if (!string.IsNullOrWhiteSpace(request.Role))
            await AssignRoleInternalAsync(user, request.Role.Trim());

        var roles = await userManager.GetRolesAsync(user);

        return MapToResponse(user, roles);
    }

    public async Task AssignRoleAsync(
        Guid userId,
        AssignRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
                       .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
                   ?? throw new NotFoundException($"Usuario con id '{userId}' no encontrado.");

        await AssignRoleInternalAsync(user, request.Role.Trim());
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var users = await userManager.Users
            .AsNoTracking()
            .OrderBy(x => x.NombreCompleto)
            .ToListAsync(cancellationToken);

        var responses = new List<UserResponse>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            responses.Add(MapToResponse(user, roles));
        }

        return responses;
    }

    private async Task AssignRoleInternalAsync(ApplicationUser user, string roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
            throw new BadRequestException("El rol es obligatorio.");

        var roleExists = await roleManager.RoleExistsAsync(roleName);

        if (!roleExists)
            throw new NotFoundException($"El rol '{roleName}' no existe.");

        if (await userManager.IsInRoleAsync(user, roleName))
            return;

        var result = await userManager.AddToRoleAsync(user, roleName);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));
    }

    private static string GetIdentityErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(e => e.Description));
    }

    private static UserResponse MapToResponse(ApplicationUser user, IList<string> roles)
    {
        return new UserResponse(
            user.Id,
            user.UserName ?? string.Empty,
            user.NombreCompleto,
            user.Email,
            user.Activo,
            roles.ToList());
    }
}