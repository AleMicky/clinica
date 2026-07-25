using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.UnidadesMedida;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class UnidadesMedidaService(
    ParametrosDbContext context
) : IUnidadesMedidaService
{
    public async Task<PagedResult<UnidadesMedidaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await context.UnidadesMedida
            .AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<UnidadesMedidaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.UnidadesMedida
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<UnidadesMedidaResponse> CreateAsync(
        CreateUnidadesMedidaRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new UnidadesMedida
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Simbolo = StringNormalize.Required(request.Simbolo),
        };

        context.UnidadesMedida.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<UnidadesMedidaResponse> UpdateAsync(
        Guid id,
        UpdateUnidadesMedidaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.UnidadesMedida
            .GetRequiredAsync(id, "Unidad de medida no encontrada.", cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Simbolo = StringNormalize.Required(request.Simbolo);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.UnidadesMedida
            .GetRequiredAsync(id, "Unidad de medida no encontrada.", cancellationToken);

        context.UnidadesMedida.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await context.UnidadesMedida.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<UnidadesMedida>(codigo, currentId),
            "El código ya existe.",
            cancellationToken);
    }

    private static UnidadesMedidaResponse ToResponse(UnidadesMedida entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Simbolo);
}
