using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Roles;
using Clinica.Modules.Seguridad.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly RoleManager<ApplicationRole> _roleManager;

    public RoleService(RoleManager<ApplicationRole> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<RoleResponse> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken = default)
    {
        if (await _roleManager.RoleExistsAsync(request.Name))
        {
            throw new ArgumentException($"El rol '{request.Name}' ya existe.");
        }

        var role = new ApplicationRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            NormalizedName = request.Name.ToUpperInvariant(),
            Descripcion = request.Descripcion
        };

        var result = await _roleManager.CreateAsync(role);
        if (!result.Succeeded)
        {
            throw new ArgumentException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return new RoleResponse(role.Id, role.Name ?? string.Empty, role.Descripcion);
    }

    public Task<IReadOnlyList<RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var roles = _roleManager.Roles
            .Select(r => new RoleResponse(r.Id, r.Name ?? string.Empty, r.Descripcion))
            .ToList();

        return Task.FromResult<IReadOnlyList<RoleResponse>>(roles);
    }
}
