using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Seguridad.Roles;

public sealed class RolService(RoleManager<Rol> roleManager)
{
    public async Task<PagedResult<RolResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken)
    {
        var query = roleManager.Roles.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                x.Name != null &&
                x.Name.Contains(search.Trim()));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Name)
            .Skip((pagination.ValidPage - 1) * pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<RolResponse>(
            RolMapper.ToResponse(items),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<RolResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var rol = await roleManager.Roles
                      .AsNoTracking()
                      .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
                  ?? throw new NotFoundException("Rol", id);

        return RolMapper.ToResponse(rol);
    }

    public async Task<RolResponse> CrearAsync(
        CreateRolRequest request)
    {
        var nombre = NormalizarNombre(request.Nombre);

        if (await roleManager.FindByNameAsync(nombre) is not null)
        {
            throw new BusinessException(
                "Ya existe un rol con ese nombre.");
        }

        var rol = new Rol
        {
            Name = nombre,
            Descripcion = LimpiarDescripcion(request.Descripcion)
        };

        (await roleManager.CreateAsync(rol)).EnsureSuccess();

        return RolMapper.ToResponse(rol);
    }

    public async Task<RolResponse> ActualizarAsync(
        int id,
        UpdateRolRequest request)
    {
        var rol = await roleManager.FindByIdAsync(id.ToString())
                  ?? throw new NotFoundException("Rol", id);

        var nombre = NormalizarNombre(request.Nombre);

        var existente = await roleManager.FindByNameAsync(nombre);

        if (existente is not null && existente.Id != id)
        {
            throw new BusinessException(
                "Ya existe otro rol con ese nombre.");
        }

        rol.Name = nombre;
        rol.Descripcion = LimpiarDescripcion(request.Descripcion);

        (await roleManager.UpdateAsync(rol)).EnsureSuccess();

        return RolMapper.ToResponse(rol);
    }

    public async Task EliminarAsync(int id)
    {
        var rol = await roleManager.FindByIdAsync(id.ToString())
                  ?? throw new NotFoundException("Rol", id);

        if (rol.Name == "ADMINISTRADOR")
        {
            throw new BusinessException(
                "El rol ADMINISTRADOR no puede eliminarse.");
        }

        (await roleManager.DeleteAsync(rol)).EnsureSuccess();
    }

    private static string NormalizarNombre(string nombre)
    {
        if (string.IsNullOrWhiteSpace(nombre))
        {
            throw new ValidationException(
                "nombre",
                "El nombre del rol es obligatorio.");
        }

        return nombre.Trim().ToUpperInvariant();
    }

    private static string? LimpiarDescripcion(string? descripcion)
    {
        return string.IsNullOrWhiteSpace(descripcion)
            ? null
            : descripcion.Trim();
    }
}