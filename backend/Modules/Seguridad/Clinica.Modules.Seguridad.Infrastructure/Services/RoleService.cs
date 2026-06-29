using Clinica.Modules.Seguridad.Application;
using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Roles;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class RoleService(
    RoleManager<ApplicationRole> roleManager,
    UserManager<ApplicationUser> userManager
) : IRoleService
{
    private static readonly HashSet<string> SystemRoles =
        SeguridadRoles.Definitions
            .Select(definition => definition.Name)
            .ToHashSet(StringComparer.Ordinal);

    public async Task<RoleResponse> CreateAsync(
        CreateRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var exists = await roleManager.RoleExistsAsync(request.Name);

        if (exists)
            throw new BusinessException("El rol ya existe.");

        var role = new ApplicationRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            NormalizedName = request.Name.Trim().ToUpperInvariant(),
            Descripcion = request.Descripcion?.Trim()
        };

        var result = await roleManager.CreateAsync(role);

        return !result.Succeeded
            ? throw new BusinessException("No se pudo crear el rol.")
            : MapToResponse(role);
    }

    public async Task<RoleResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var role = await FindRoleAsync(id, cancellationToken);

        return MapToResponse(role);
    }

    public Task<IReadOnlyList<RoleResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var roles = roleManager.Roles
            .OrderBy(r => r.Name)
            .Select(MapToResponse)
            .ToList()
            .AsReadOnly();

        return Task.FromResult<IReadOnlyList<RoleResponse>>(roles);
    }

    public async Task<RoleResponse> UpdateAsync(
        Guid id,
        UpdateRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var role = await FindRoleAsync(id, cancellationToken);
        var newName = request.Name.Trim();

        if (!string.Equals(role.Name, newName, StringComparison.Ordinal))
        {
            var nameExists = await roleManager.RoleExistsAsync(newName);

            if (nameExists)
                throw new BusinessException($"El rol '{newName}' ya existe.");
        }

        role.Name = newName;
        role.NormalizedName = newName.ToUpperInvariant();
        role.Descripcion = request.Descripcion?.Trim();

        var result = await roleManager.UpdateAsync(role);

        if (!result.Succeeded)
            throw new BusinessException("No se pudo actualizar el rol.");

        return MapToResponse(role);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var role = await FindRoleAsync(id, cancellationToken);

        if (role.Name is not null && SystemRoles.Contains(role.Name))
            throw new BusinessException($"No se puede eliminar el rol del sistema '{role.Name}'.");

        var usersInRole = await userManager.GetUsersInRoleAsync(role.Name!);

        if (usersInRole.Count > 0)
            throw new BusinessException(
                $"No se puede eliminar el rol '{role.Name}' porque tiene usuarios asignados.");

        var result = await roleManager.DeleteAsync(role);

        if (!result.Succeeded)
            throw new BusinessException("No se pudo eliminar el rol.");
    }

    private async Task<ApplicationRole> FindRoleAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await roleManager.Roles
                   .FirstOrDefaultAsync(r => r.Id == id, cancellationToken)
               ?? throw new NotFoundException($"Rol con id '{id}' no encontrado.");
    }

    private static RoleResponse MapToResponse(ApplicationRole role)
    {
        return new RoleResponse(role.Id, role.Name ?? string.Empty, role.Descripcion);
    }
}
