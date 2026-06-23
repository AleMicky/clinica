using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Roles;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class RoleService(
    RoleManager<ApplicationRole> roleManager
) : IRoleService
{
    public async Task<RoleResponse> CreateAsync(CreateRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var exists = await roleManager.RoleExistsAsync(request.Name);

        if (exists)
            throw new BusinessException("El rol ya existe.");

        var role = new ApplicationRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            NormalizedName = request.Name.ToUpperInvariant(),
            Descripcion = request.Descripcion
        };

        var result = await roleManager.CreateAsync(role);

        return !result.Succeeded
            ? throw new BusinessException("No se pudo crear el rol.")
            : new RoleResponse(role.Id, role.Name ?? string.Empty, role.Descripcion);
    }

    public Task<IReadOnlyList<RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var roles = roleManager.Roles
            .Select(r => new RoleResponse(r.Id, r.Name ?? string.Empty, r.Descripcion))
            .ToList()
            .AsReadOnly();

        return Task.FromResult<IReadOnlyList<RoleResponse>>(roles);
    }
}