using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.UnidadesMedida;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class UnidadMedidaService(AlmacenDbContext context) : IUnidadMedidaService
{
    public async Task<PagedResult<UnidadMedidaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        await context.UnidadesMedida.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);

    public async Task<UnidadMedidaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        await context.UnidadesMedida.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<UnidadMedidaResponse> CreateAsync(
        CreateUnidadMedidaRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await context.UnidadesMedida.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<UnidadMedida>(codigo, null),
            "El código ya existe.",
            cancellationToken);

        var entity = new UnidadMedida
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Abreviatura = StringNormalize.Optional(request.Abreviatura),
            PermiteDecimales = request.PermiteDecimales,
            CreatedAt = DateTime.UtcNow,
        };
        context.UnidadesMedida.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<UnidadMedidaResponse> UpdateAsync(
        Guid id,
        UpdateUnidadMedidaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.UnidadesMedida
            .GetRequiredAsync(id, "Unidad de medida no encontrada.", cancellationToken);
        var codigo = StringNormalize.Required(request.Codigo);
        await context.UnidadesMedida.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<UnidadMedida>(codigo, id),
            "El código ya existe.",
            cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Abreviatura = StringNormalize.Optional(request.Abreviatura);
        entity.PermiteDecimales = request.PermiteDecimales;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.UnidadesMedida
            .GetRequiredAsync(id, "Unidad de medida no encontrada.", cancellationToken);
        if (await context.Productos.AnyAsync(x => x.UnidadMedidaId == id, cancellationToken))
            throw new BusinessException("No se puede eliminar una unidad con productos asociados.");

        context.UnidadesMedida.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static UnidadMedidaResponse ToResponse(UnidadMedida e) =>
        new(e.Id, e.Codigo, e.Nombre, e.Abreviatura, e.PermiteDecimales);
}
