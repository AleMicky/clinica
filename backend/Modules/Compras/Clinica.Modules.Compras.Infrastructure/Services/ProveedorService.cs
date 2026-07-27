using Clinica.Modules.Compras.Application.Abstractions;
using Clinica.Modules.Compras.Application.Proveedores;
using Clinica.Modules.Compras.Domain.Entities;
using Clinica.Modules.Compras.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Compras.Infrastructure.Services;

public sealed class ProveedorService(ComprasDbContext context) : IProveedorService
{
    public async Task<PagedResult<ProveedorResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Proveedores.AsNoTracking().AsQueryable();

        return await query
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<ProveedorResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        await context.Proveedores.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<ProveedorResponse> CreateAsync(
        CreateProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await context.Proveedores.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<Proveedor>(codigo, null),
            "El código ya existe.",
            cancellationToken);

        var entity = new Proveedor
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Nit = request.Nit,
            Telefono = request.Telefono,
            Email = request.Email,
            Activo = request.Activo,
            CreatedAt = DateTime.UtcNow,
        };
        context.Proveedores.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<ProveedorResponse> UpdateAsync(
        Guid id,
        UpdateProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Proveedores
            .GetRequiredAsync(id, "Proveedor no encontrado.", cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await context.Proveedores.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<Proveedor>(codigo, id),
            "El código ya existe.",
            cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Nit = request.Nit;
        entity.Telefono = request.Telefono;
        entity.Email = request.Email;
        entity.Activo = request.Activo;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Proveedores
            .GetRequiredAsync(id, "Proveedor no encontrado.", cancellationToken);
        var hasOrdenes = await context.OrdenesCompra.AnyAsync(x => x.ProveedorId == id, cancellationToken);
        if (hasOrdenes)
            throw new SharedKernel.Exceptions.BusinessException(
                "No se puede eliminar el proveedor porque tiene órdenes asociadas.");

        context.Proveedores.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static ProveedorResponse ToResponse(Proveedor e) =>
        new(e.Id, e.Codigo, e.Nombre, e.Nit, e.Telefono, e.Email, e.Activo);
}
