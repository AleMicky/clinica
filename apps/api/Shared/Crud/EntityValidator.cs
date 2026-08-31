using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Shared.Crud;

public class EntityValidator : IEntityValidator
{
    public async Task EnsureExistsAsync<TEntity>(
        IQueryable<TEntity> query,
        int id,
        CancellationToken cancellationToken = default)
        where TEntity : class
    {
        var existe = await query.AnyAsync(x => EF.Property<int>(x, "Id") == id, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(
                typeof(TEntity).Name, id);
        }
    }

    public async Task EnsureActiveAsync<TEntity>(
        IQueryable<TEntity> query,
        int id,
        CancellationToken cancellationToken = default)
        where TEntity : class
    {
        var existe = await
            query.AnyAsync(x
                    => EF.Property<int>(x, "Id") == id
                       && EF.Property<bool>(x, "Activo"),
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(typeof(TEntity).Name, id);
        }
    }
}