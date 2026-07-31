using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.FormasFarmaceuticas;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class FormaFarmaceuticaService(AlmacenDbContext context) : IFormaFarmaceuticaService
{
    public async Task<PagedResult<FormaFarmaceuticaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        await context.FormasFarmaceuticas.AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);

    public async Task<FormaFarmaceuticaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        await context.FormasFarmaceuticas.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<FormaFarmaceuticaResponse> CreateAsync(
        CreateFormaFarmaceuticaRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await context.FormasFarmaceuticas.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<FormaFarmaceutica>(codigo, null),
            "El código ya existe.",
            cancellationToken);

        var entity = new FormaFarmaceutica
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion),
            CreatedAt = DateTime.UtcNow,
        };
        context.FormasFarmaceuticas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<FormaFarmaceuticaResponse> UpdateAsync(
        Guid id,
        UpdateFormaFarmaceuticaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FormasFarmaceuticas
            .GetRequiredAsync(id, "Forma farmacéutica no encontrada.", cancellationToken);
        var codigo = StringNormalize.Required(request.Codigo);
        await context.FormasFarmaceuticas.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<FormaFarmaceutica>(codigo, id),
            "El código ya existe.",
            cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.FormasFarmaceuticas
            .GetRequiredAsync(id, "Forma farmacéutica no encontrada.", cancellationToken);
        if (await context.MedicamentosDetalle.AnyAsync(x => x.FormaFarmaceuticaId == id, cancellationToken))
            throw new BusinessException("No se puede eliminar una forma farmacéutica en uso.");

        context.FormasFarmaceuticas.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static FormaFarmaceuticaResponse ToResponse(FormaFarmaceutica e) =>
        new(e.Id, e.Codigo, e.Nombre, e.Descripcion);
}
