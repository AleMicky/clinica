using Clinica.Api.Modules.Seguridad.Roles.Dtos;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Clinica.Api.Modules.Seguridad.Roles.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Seguridad.Roles.Services;

public sealed class RolService(RoleManager<Rol> roleManager)
{
    private const string RolAdministrador = "ADMINISTRADOR";

    public async Task<PagedResult<RolResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken)
    {
        var query = roleManager.Roles.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.Name != null && x.Name.Contains(term));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var roles = await query
            .OrderBy(x => x.Name)
            .Skip(
                (pagination.ValidPage - 1) *
                pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<RolResponse>(
            RolMapper.ToResponse(roles),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<RolResponse> ObtenerAsync(int id, CancellationToken cancellationToken)
    {
        var rol = await roleManager.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (rol is null)
        {
            throw new NotFoundException("Rol", id);
        }

        return RolMapper.ToResponse(rol);
    }

    public async Task<RolResponse> CrearAsync(CreateRolRequest request, CancellationToken cancellationToken)
    {
        await ValidarNombreUnicoAsync(request.Name, cancellationToken);

        var rol = new Rol
        {
            Name = request.Name.TrimUpper(),
            Descripcion = request.Descripcion.TrimOrNull()
        };

        cancellationToken.ThrowIfCancellationRequested();
        var result = await roleManager.CreateAsync(rol);
        result.EnsureSuccess();
        return RolMapper.ToResponse(rol);
    }

    public async Task<RolResponse> ActualizarAsync(int id, UpdateRolRequest request,
        CancellationToken cancellationToken)
    {
        var rol = await roleManager.Roles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (rol is null)
        {
            throw new NotFoundException("Rol", id);
        }

        await ValidarNombreUnicoAsync(request.Name, cancellationToken, id);
        rol.Name = request.Name.TrimUpper();
        rol.Descripcion = request.Descripcion.TrimOrNull();

        cancellationToken.ThrowIfCancellationRequested();
        var result = await roleManager.UpdateAsync(rol);

        result.EnsureSuccess();

        return RolMapper.ToResponse(rol);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var rol = await roleManager.Roles
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (rol is null)
        {
            throw new NotFoundException("Rol", id);
        }

        ValidarRolProtegido(rol);

        cancellationToken.ThrowIfCancellationRequested();

        var result = await roleManager.DeleteAsync(rol);

        result.EnsureSuccess();
    }

    private async Task ValidarNombreUnicoAsync(
        string nombre,
        CancellationToken cancellationToken,
        int? excluirId = null)
    {
        var nombreNormalizado = nombre.TrimUpper();

        var existe = await roleManager.Roles
            .AsNoTracking()
            .AnyAsync(
                x => x.NormalizedName == nombreNormalizado &&
                     (!excluirId.HasValue || x.Id != excluirId.Value),
                cancellationToken);

        if (existe)
        {
            throw new BusinessException(
                "Ya existe un rol con ese nombre.");
        }
    }

    private static void ValidarRolProtegido(Rol rol)
    {
        if (string.Equals(
                rol.Name,
                RolAdministrador,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(
                $"El rol {RolAdministrador} no puede eliminarse.");
        }
    }
}