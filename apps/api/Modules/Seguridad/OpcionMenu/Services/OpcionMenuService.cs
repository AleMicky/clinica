using Clinica.Api.Data;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using OpcionMenuEntity = Clinica.Api.Modules.Seguridad.OpcionMenu.Entity.OpcionMenu;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Services;

public sealed class OpcionMenuService(AppDbContext dbContext)
{
    public async Task<PagedResult<OpcionMenuResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.OpcionesMenu
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                x.Codigo.Contains(term) ||
                x.Nombre.Contains(term) ||
                (x.Ruta != null && x.Ruta.Contains(term)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.PadreId)
            .ThenBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Skip(
                (pagination.ValidPage - 1) *
                pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<OpcionMenuResponse>(
            OpcionMenuMapper.ToResponse(items),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<OpcionMenuResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.OpcionesMenu
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(OpcionMenuEntity), id);

        return OpcionMenuMapper.ToResponse(entity);
    }

    public async Task<OpcionMenuResponse> CrearAsync(
        CreateOpcionMenuRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarCodigoAsync(
            request.Codigo,
            null,
            cancellationToken);

        await ValidarPadreAsync(
            request.PadreId,
            null,
            cancellationToken);

        var entity = OpcionMenuMapper.ToEntity(request);

        Normalizar(entity, request);

        entity.Activo = true;

        dbContext.OpcionesMenu.Add(entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return OpcionMenuMapper.ToResponse(entity);
    }

    public async Task<OpcionMenuResponse> ActualizarAsync(
        int id,
        UpdateOpcionMenuRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.OpcionesMenu
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(OpcionMenuEntity), id);

        await ValidarCodigoAsync(
            request.Codigo,
            id,
            cancellationToken);

        await ValidarPadreAsync(
            request.PadreId,
            id,
            cancellationToken);

        OpcionMenuMapper.UpdateEntity(request, entity);

        Normalizar(entity, request);

        await dbContext.SaveChangesAsync(cancellationToken);

        return OpcionMenuMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.OpcionesMenu
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(OpcionMenuEntity), id);

        await ValidarEliminacionAsync(
            id,
            cancellationToken);

        dbContext.OpcionesMenu.Remove(entity);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task InactivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.OpcionesMenu
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(OpcionMenuEntity), id);

        if (!entity.Activo)
            return;

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.OpcionesMenu
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(OpcionMenuEntity), id);

        if (entity.Activo)
            return;

        entity.Activo = true;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<OpcionMenuTreeResponse>> ObtenerArbolAsync(
        CancellationToken cancellationToken = default)
    {
        var opciones = await dbContext.OpcionesMenu
            .AsNoTracking()
            .Where(x => x.Activo)
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        return ConstruirArbol(
            opciones,
            null);
    }

    private async Task ValidarCodigoAsync(
        string codigo,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var valor = NormalizarCodigo(codigo);

        var query = dbContext.OpcionesMenu
            .AsNoTracking()
            .Where(x => x.Codigo == valor);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        var existe = await query.AnyAsync(cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una opción de menú con el código '{valor}'.");
        }
    }

    private async Task ValidarPadreAsync(
        int? padreId,
        int? opcionId,
        CancellationToken cancellationToken)
    {
        if (!padreId.HasValue)
            return;

        if (opcionId.HasValue &&
            padreId.Value == opcionId.Value)
        {
            throw new ConflictException(
                "Una opción de menú no puede ser su propio padre.");
        }

        var padreExiste = await dbContext.OpcionesMenu
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == padreId.Value,
                cancellationToken);

        if (!padreExiste)
        {
            throw new NotFoundException(
                nameof(OpcionMenuEntity),
                padreId.Value);
        }

        if (opcionId.HasValue)
        {
            var generaCiclo = await GeneraCicloAsync(
                opcionId.Value,
                padreId.Value,
                cancellationToken);

            if (generaCiclo)
            {
                throw new ConflictException(
                    "No se puede asignar este padre porque generaría una relación circular en el menú.");
            }
        }
    }

    private async Task<bool> GeneraCicloAsync(
        int opcionId,
        int nuevoPadreId,
        CancellationToken cancellationToken)
    {
        var actualId = nuevoPadreId;

        while (true)
        {
            if (actualId == opcionId)
                return true;

            var padreId = await dbContext.OpcionesMenu
                .AsNoTracking()
                .Where(x => x.Id == actualId)
                .Select(x => x.PadreId)
                .FirstOrDefaultAsync(cancellationToken);

            if (!padreId.HasValue)
                return false;

            actualId = padreId.Value;
        }
    }

    private async Task ValidarEliminacionAsync(
        int opcionMenuId,
        CancellationToken cancellationToken)
    {
        var tieneHijos = await dbContext.OpcionesMenu
            .AsNoTracking()
            .AnyAsync(
                x => x.PadreId == opcionMenuId,
                cancellationToken);

        if (tieneHijos)
        {
            throw new ConflictException(
                "No se puede eliminar la opción de menú porque tiene opciones hijas.");
        }
    }

    private static IReadOnlyCollection<OpcionMenuTreeResponse> ConstruirArbol(
        IReadOnlyCollection<OpcionMenuEntity> opciones,
        int? padreId)
    {
        return opciones
            .Where(x => x.PadreId == padreId)
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Select(x => new OpcionMenuTreeResponse
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

    private static void Normalizar(
        OpcionMenuEntity entity,
        OpcionMenuRequest request)
    {
        entity.Codigo = NormalizarCodigo(request.Codigo);

        entity.Nombre = NormalizarTexto(request.Nombre);

        entity.Ruta = NormalizarOpcional(request.Ruta);

        entity.Icono = NormalizarOpcional(request.Icono);

        entity.PadreId = request.PadreId;

        entity.Orden = request.Orden;
    }

    private static string NormalizarCodigo(
        string value)
    {
        return value
            .Trim()
            .ToUpperInvariant();
    }

    private static string NormalizarTexto(
        string value)
    {
        return value.Trim();
    }

    private static string? NormalizarOpcional(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}