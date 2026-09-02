using Clinica.Api.Data;
using Clinica.Api.Modules.Compras.Proveedor.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using ProveedorMapper = Clinica.Api.Modules.Compras.Proveedor.Mappers.ProveedorMapper;

namespace Clinica.Api.Modules.Compras.Proveedor.Services;

public interface IProveedorService
{
    Task<PagedResult<ProveedorResponse>> ListarAsync(
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<ProveedorResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ProveedorResponse> CrearAsync(
        CreateProveedorRequest request,
        CancellationToken cancellationToken = default);

    Task<ProveedorResponse> ActualizarAsync(
        int id,
        UpdateProveedorRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public sealed class ProveedorService(AppDbContext dbContext)
    : IProveedorService
{
    public async Task<PagedResult<ProveedorResponse>> ListarAsync(
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .Proveedores
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(termino) ||
                x.RazonSocial.Contains(termino) ||
                (x.NombreComercial != null && x.NombreComercial.Contains(termino)) ||
                (x.Nit != null && x.Nit.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var proveedores = await query
            .OrderBy(x => x.RazonSocial)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = ProveedorMapper.ToResponse(proveedores);

        return new PagedResult<ProveedorResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<ProveedorResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var proveedor = await dbContext
            .Proveedores
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (proveedor is null || !proveedor.Activo)
        {
            throw new NotFoundException(nameof(ProveedorEntity), id);
        }

        return ProveedorMapper.ToResponse(proveedor);
    }

    public async Task<ProveedorResponse> CrearAsync(
        CreateProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: null,
            cancellationToken);

        await ValidarNitUnicoAsync(
            request.Nit,
            idExcluido: null,
            cancellationToken);

        var entity = ProveedorMapper.ToEntity(request);
        entity.Codigo = entity.Codigo.Trim().ToUpperInvariant();

        dbContext.Proveedores.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProveedorMapper.ToResponse(entity);
    }

    public async Task<ProveedorResponse> ActualizarAsync(
        int id,
        UpdateProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Proveedores
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ProveedorEntity), id);
        }

        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: id,
            cancellationToken);

        await ValidarNitUnicoAsync(
            request.Nit,
            idExcluido: id,
            cancellationToken);

        ProveedorMapper.UpdateEntity(request, entity);
        entity.Codigo = entity.Codigo.Trim().ToUpperInvariant();

        await dbContext.SaveChangesAsync(cancellationToken);

        return ProveedorMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Proveedores
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ProveedorEntity), id);
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarCodigoUnicoAsync(
        string codigo,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var codigoNormalizado = codigo.Trim().ToUpperInvariant();

        var existe = await dbContext.Proveedores
            .AnyAsync(
                x => x.Codigo == codigoNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un proveedor con el código '{codigoNormalizado}'.");
        }
    }

    private async Task ValidarNitUnicoAsync(
        string? nit,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(nit))
        {
            return;
        }

        var nitNormalizado = nit.Trim();

        var existe = await dbContext.Proveedores
            .AnyAsync(
                x => x.Nit != null &&
                     x.Nit == nitNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un proveedor con el NIT '{nitNormalizado}'.");
        }
    }
}
