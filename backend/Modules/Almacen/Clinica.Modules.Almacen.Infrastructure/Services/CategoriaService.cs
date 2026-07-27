using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class CategoriaService(AlmacenDbContext context) : ICategoriaService
{
    public async Task<PagedResult<CategoriaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await context.Categorias
            .AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<CategoriaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Categorias
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CategoriaResponse> CreateAsync(
        CreateCategoriaRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Categoria
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Activo = request.Activo,
            CreatedAt = DateTime.UtcNow,
        };

        context.Categorias.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<CategoriaResponse> UpdateAsync(
        Guid id,
        UpdateCategoriaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Categorias
            .GetRequiredAsync(id, "Categoría no encontrada.", cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Activo = request.Activo;
        entity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Categorias
            .GetRequiredAsync(id, "Categoría no encontrada.", cancellationToken);

        var hasProductos = await context.Productos.AnyAsync(x => x.CategoriaId == id, cancellationToken);
        if (hasProductos)
            throw new SharedKernel.Exceptions.BusinessException(
                "No se puede eliminar la categoría porque tiene productos asociados.");

        context.Categorias.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await context.Categorias.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<Categoria>(codigo, currentId),
            "El código ya existe.",
            cancellationToken);
    }

    private static CategoriaResponse ToResponse(Categoria entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Activo);
}
