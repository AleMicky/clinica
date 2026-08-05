using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

public sealed class UsuarioService(
    UserManager<Usuario> userManager,
    RoleManager<Rol> roleManager
)
{
    public async Task<PagedResult<UsuarioResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken
    )
    {
        var query = userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                x.UserName!.Contains(term) ||
                x.Email!.Contains(term) ||
                x.Nombres.Contains(term) ||
                x.Apellidos.Contains(term));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var usuarios = await query
            .OrderBy(x => x.Nombres)
            .ThenBy(x => x.Apellidos)
            .Skip((pagination.ValidPage - 1) * pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        var items = new List<UsuarioResponse>();

        foreach (var usuario in usuarios)
        {
            var roles = await userManager.GetRolesAsync(usuario);

            items.Add(new UsuarioResponse
            {
                Id = usuario.Id,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Email = usuario.Email ?? string.Empty,
                UserName = usuario.UserName ?? string.Empty,
                Activo = usuario.Activo,
                Roles = roles.ToList()
            });
        }

        return new PagedResult<UsuarioResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<UsuarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await userManager.Users
                          .AsNoTracking()
                          .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
                      ?? throw new NotFoundException("Usuario", id);

        var roles = await userManager.GetRolesAsync(usuario);

        return new UsuarioResponse
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Email = usuario.Email ?? string.Empty,
            UserName = usuario.UserName ?? string.Empty,
            Activo = usuario.Activo,
            Roles = roles.ToList()
        };
    }

    public async Task<UsuarioResponse> CrearAsync(
        CreateUsuarioRequest request)
    {
        if (await userManager.FindByNameAsync(request.UserName) is not null)
        {
            throw new BusinessException("El nombre de usuario ya existe.");
        }

        if (await userManager.FindByEmailAsync(request.Email) is not null)
        {
            throw new BusinessException("El correo electrónico ya existe.");
        }

        var usuario = new Usuario
        {
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            Nombres = request.Nombres.Trim(),
            Apellidos = request.Apellidos.Trim(),
            EmailConfirmed = true,
            Activo = true
        };

        (await userManager.CreateAsync(usuario, request.Password))
            .EnsureSuccess();

        if (request.Roles.Count > 0)
        {
            var nombresRoles = await ObtenerRoles(request.Roles);

            (await userManager.AddToRolesAsync(usuario, nombresRoles))
                .EnsureSuccess();
        }

        var roles = await userManager.GetRolesAsync(usuario);

        return new UsuarioResponse
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Email = usuario.Email ?? string.Empty,
            UserName = usuario.UserName ?? string.Empty,
            Activo = usuario.Activo,
            Roles = roles.ToList()
        };
    }

    public async Task<UsuarioResponse> ActualizarAsync(
        int id,
        UpdateUsuarioRequest request)
    {
        var usuario = await userManager.FindByIdAsync(id.ToString())
                      ?? throw new NotFoundException("Usuario", id);

        usuario.Nombres = request.Nombres.Trim();
        usuario.Apellidos = request.Apellidos.Trim();
        usuario.Email = request.Email.Trim();
        usuario.UserName = request.UserName.Trim();
        usuario.Activo = request.Activo;

        (await userManager.UpdateAsync(usuario))
            .EnsureSuccess();

        var rolesActuales = await userManager.GetRolesAsync(usuario);

        if (rolesActuales.Count > 0)
        {
            (await userManager.RemoveFromRolesAsync(usuario, rolesActuales))
                .EnsureSuccess();
        }

        if (request.Roles.Count > 0)
        {
            var nombresRoles = await ObtenerRoles(request.Roles);

            (await userManager.AddToRolesAsync(usuario, nombresRoles))
                .EnsureSuccess();
        }

        var roles = await userManager.GetRolesAsync(usuario);

        return new UsuarioResponse
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Email = usuario.Email ?? string.Empty,
            UserName = usuario.UserName ?? string.Empty,
            Activo = usuario.Activo,
            Roles = roles.ToList()
        };
    }

    public async Task EliminarAsync(int id)
    {
        var usuario = await userManager.FindByIdAsync(id.ToString())
                      ?? throw new NotFoundException("Usuario", id);

        (await userManager.DeleteAsync(usuario))
            .EnsureSuccess();
    }

    private async Task<List<string>> ObtenerRoles(
        IEnumerable<int> ids)
    {
        var roles = await roleManager.Roles
            .Where(x => ids.Contains(x.Id))
            .ToListAsync();

        if (roles.Count != ids.Count())
        {
            throw new BusinessException(
                "Uno o más roles no existen.");
        }

        return roles
            .Select(x => x.Name!)
            .ToList();
    }
}