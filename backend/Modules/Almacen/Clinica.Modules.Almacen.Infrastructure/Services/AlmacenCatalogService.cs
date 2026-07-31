using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Almacenes;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Modules.Almacen.Domain.Entities.Almacen;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class AlmacenCatalogService(AlmacenDbContext context) : IAlmacenCatalogService
{
    public async Task<IReadOnlyList<TipoAlmacenResponse>> GetTiposAsync(
        CancellationToken cancellationToken = default) =>
        await context.TiposAlmacen.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => new TipoAlmacenResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion))
            .ToListAsync(cancellationToken);

    public async Task<PagedResult<AlmacenResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        await context.Almacenes.AsNoTracking()
            .Include(x => x.TipoAlmacen)
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);

    public async Task<AlmacenResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Almacenes.AsNoTracking()
            .Include(x => x.TipoAlmacen)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? null : ToResponse(entity);
    }

    public async Task<AlmacenResponse> CreateAsync(
        CreateAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await context.Almacenes.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<AlmacenEntity>(codigo, null),
            "El código ya existe.",
            cancellationToken);

        if (!await context.TiposAlmacen.AnyAsync(x => x.Id == request.TipoAlmacenId, cancellationToken))
            throw new NotFoundException("Tipo de almacén no encontrado.");

        var entity = new AlmacenEntity
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion),
            TipoAlmacenId = request.TipoAlmacenId,
            ResponsableEmpleadoId = request.ResponsableEmpleadoId,
            PermiteVenta = request.PermiteVenta,
            PermiteDispensacion = request.PermiteDispensacion,
            PermiteStockNegativo = request.PermiteStockNegativo,
            CreatedAt = DateTime.UtcNow,
        };
        context.Almacenes.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(entity).Reference(x => x.TipoAlmacen).LoadAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<AlmacenResponse> UpdateAsync(
        Guid id,
        UpdateAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Almacenes
            .Include(x => x.TipoAlmacen)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Almacén no encontrado.");

        var codigo = StringNormalize.Required(request.Codigo);
        await context.Almacenes.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<AlmacenEntity>(codigo, id),
            "El código ya existe.",
            cancellationToken);

        if (!await context.TiposAlmacen.AnyAsync(x => x.Id == request.TipoAlmacenId, cancellationToken))
            throw new NotFoundException("Tipo de almacén no encontrado.");

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.TipoAlmacenId = request.TipoAlmacenId;
        entity.ResponsableEmpleadoId = request.ResponsableEmpleadoId;
        entity.PermiteVenta = request.PermiteVenta;
        entity.PermiteDispensacion = request.PermiteDispensacion;
        entity.PermiteStockNegativo = request.PermiteStockNegativo;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(entity).Reference(x => x.TipoAlmacen).LoadAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Almacenes
            .GetRequiredAsync(id, "Almacén no encontrado.", cancellationToken);

        if (await context.ProductosStock.AnyAsync(x => x.AlmacenId == id && x.CantidadDisponible > 0, cancellationToken))
            throw new BusinessException("No se puede eliminar un almacén con stock.");

        context.Almacenes.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static AlmacenResponse ToResponse(AlmacenEntity e) =>
        new(
            e.Id,
            e.Codigo,
            e.Nombre,
            e.Descripcion,
            e.TipoAlmacenId,
            e.TipoAlmacen?.Nombre ?? string.Empty,
            e.ResponsableEmpleadoId,
            e.PermiteVenta,
            e.PermiteDispensacion,
            e.PermiteStockNegativo);
}
