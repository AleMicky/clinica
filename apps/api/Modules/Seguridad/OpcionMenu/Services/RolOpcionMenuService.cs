using System.Security.Claims;
using Clinica.Api.Data;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Mappers;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using OpcionMenuEntity = Clinica.Api.Modules.Seguridad.OpcionMenu.Entity.OpcionMenu;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Services;

public sealed class RolOpcionMenuService(AppDbContext dbContext)
{
    public async Task<RolOpcionMenuResponse> CrearAsync(int rolId, CreateRolOpcionMenuRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarRolAsync(rolId, cancellationToken);
        await ValidarOpcionAsync(request.OpcionMenuId, cancellationToken);

        var relacionExistente = await dbContext.RolesOpcionesMenu
            .FirstOrDefaultAsync(
                x =>
                    x.RolId == rolId &&
                    x.OpcionMenuId == request.OpcionMenuId,
                cancellationToken);

        if (relacionExistente is not null)
        {
            if (relacionExistente.Activo)
            {
                throw new ConflictException(
                    "La opción de menú ya está asignada al rol.");
            }

            relacionExistente.Activo = true;

            await dbContext.SaveChangesAsync(cancellationToken);

            var reactivada = await dbContext.RolesOpcionesMenu
                .AsNoTracking()
                .Include(x => x.OpcionMenu)
                .FirstAsync(
                    x => x.Id == relacionExistente.Id,
                    cancellationToken);

            return RolOpcionMenuMapper.ToResponse(reactivada);
        }

        var entity = new RolOpcionMenu
        {
            RolId = rolId,
            OpcionMenuId = request.OpcionMenuId,
            Activo = true
        };

        dbContext.RolesOpcionesMenu.Add(entity);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        var creada = await dbContext.RolesOpcionesMenu
            .AsNoTracking()
            .Include(x => x.OpcionMenu)
            .FirstAsync(
                x => x.Id == entity.Id,
                cancellationToken);

        return RolOpcionMenuMapper.ToResponse(
            creada);
    }

    public async Task AsignarAsync(int rolId, AsignarRolOpcionMenuRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarRolAsync( rolId, cancellationToken);

        var ids = request.OpcionMenuIds
            .Distinct()
            .ToList();

        await ValidarOpcionesAsync(
            ids,
            cancellationToken);

        var actuales = await dbContext.RolesOpcionesMenu
            .Where(x => x.RolId == rolId)
            .ToListAsync(cancellationToken);

        var actualesPorOpcion = actuales
            .ToDictionary(x => x.OpcionMenuId);

        foreach (var actual in actuales)
        {
            actual.Activo = ids.Contains(
                actual.OpcionMenuId);
        }

        foreach (var opcionMenuId in ids)
        {
            if (actualesPorOpcion.ContainsKey(
                    opcionMenuId))
            {
                continue;
            }

            dbContext.RolesOpcionesMenu.Add(
                new RolOpcionMenu
                {
                    RolId = rolId,
                    OpcionMenuId = opcionMenuId,
                    Activo = true
                });
        }

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<RolOpcionesMenuResponse> ObtenerAsync(int rolId, CancellationToken cancellationToken = default)
    {
        var rol = await dbContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == rolId,
                cancellationToken);

        if (rol is null)
        {
            throw new NotFoundException(
                nameof(Rol),
                rolId);
        }

        var entidades = await dbContext.RolesOpcionesMenu
            .AsNoTracking()
            .Include(x => x.OpcionMenu)
            .Where(x =>
                x.RolId == rolId &&
                x.Activo &&
                x.OpcionMenu.Activo)
            .OrderBy(x => x.OpcionMenu.Orden)
            .ThenBy(x => x.OpcionMenu.Nombre)
            .ToListAsync(cancellationToken);

        var opciones =
            RolOpcionMenuMapper.ToResponse(
                entidades);

        return new RolOpcionesMenuResponse
        {
            RolId = rol.Id,
            RolNombre = rol.Name ?? string.Empty,
            OpcionesMenu = opciones
        };
    }

    public async Task<IReadOnlyCollection<RolOpcionMenuTreeResponse>>
        ObtenerArbolAsync(
            int rolId,
            CancellationToken cancellationToken = default)
    {
        await ValidarRolAsync(
            rolId,
            cancellationToken);

        var opciones = await dbContext.RolesOpcionesMenu
            .AsNoTracking()
            .Where(x =>
                x.RolId == rolId &&
                x.Activo &&
                x.OpcionMenu.Activo)
            .Select(x => x.OpcionMenu)
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        return ConstruirArbol(
            opciones,
            null);
    }

    public async Task QuitarAsync(
        int rolId,
        int opcionMenuId,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.RolesOpcionesMenu
            .FirstOrDefaultAsync(
                x =>
                    x.RolId == rolId &&
                    x.OpcionMenuId == opcionMenuId,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                nameof(RolOpcionMenu),
                $"{rolId}-{opcionMenuId}");
        }

        if (!entity.Activo)
            return;

        entity.Activo = false;

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
    
    

    private async Task ValidarRolAsync(
        int rolId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Roles
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == rolId,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(
                nameof(Rol),
                rolId);
        }
    }
    public async Task<IReadOnlyCollection<RolOpcionMenuTreeResponse>>
        ObtenerMenuUsuarioAsync(
            ClaimsPrincipal user,
            CancellationToken cancellationToken = default)
    {
        var userIdValue =
            user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException(
                "No se pudo identificar al usuario autenticado.");
        }

        var usuarioExiste = await dbContext.Users
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == userId,
                cancellationToken);

        if (!usuarioExiste)
        {
            throw new NotFoundException(
                "Usuario",
                userId);
        }

        var rolIds = await dbContext.UserRoles
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => x.RoleId)
            .ToListAsync(cancellationToken);

        if (rolIds.Count == 0)
        {
            return [];
        }

        var opciones = await dbContext.RolesOpcionesMenu
            .AsNoTracking()
            .Where(x =>
                rolIds.Contains(x.RolId) &&
                x.Activo &&
                x.OpcionMenu.Activo)
            .Select(x => x.OpcionMenu)
            .Distinct()
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        return ConstruirArbol(
            opciones,
            null);
    }

    private async Task ValidarOpcionAsync(
        int opcionMenuId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.OpcionesMenu
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.Id == opcionMenuId &&
                    x.Activo,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(
                nameof(OpcionMenuEntity),
                opcionMenuId);
        }
    }

    private async Task ValidarOpcionesAsync(
        IReadOnlyCollection<int> opcionMenuIds,
        CancellationToken cancellationToken)
    {
        if (opcionMenuIds.Count == 0)
            return;

        var existentes = await dbContext.OpcionesMenu
            .AsNoTracking()
            .Where(x =>
                opcionMenuIds.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var invalidas = opcionMenuIds
            .Except(existentes)
            .ToList();

        if (invalidas.Count == 0)
            return;

        throw new ConflictException(
            $"Las siguientes opciones de menú no existen o están inactivas: " +
            $"{string.Join(", ", invalidas)}.");
    }

    private static IReadOnlyCollection<RolOpcionMenuTreeResponse>
        ConstruirArbol(
            IReadOnlyCollection<OpcionMenuEntity> opciones,
            int? padreId)
    {
        return opciones
            .Where(x => x.PadreId == padreId)
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Select(x => new RolOpcionMenuTreeResponse
            {
                Id = x.Id,
                Codigo = x.Codigo,
                Nombre = x.Nombre,
                Ruta = x.Ruta,
                Icono = x.Icono,
                Orden = x.Orden,

                Hijos = ConstruirArbol(
                        opciones,
                        x.Id)
                    .ToList()
            })
            .ToList();
    }
    
    
}