using System.Linq.Expressions;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.SharedKernel.Persistence;

public static class EntityQueryExtensions
{
    public static async Task<TEntity> GetRequiredAsync<TEntity>(
        this DbSet<TEntity> set,
        Guid id,
        string notFoundMessage,
        CancellationToken cancellationToken = default)
        where TEntity : Entity
    {
        var entity = await set.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException(notFoundMessage);

        return entity;
    }

    public static async Task EnsureUniqueAsync<TEntity>(
        this IQueryable<TEntity> query,
        Expression<Func<TEntity, bool>> predicate,
        string message,
        CancellationToken cancellationToken = default)
    {
        var exists = await query.AnyAsync(predicate, cancellationToken);

        if (exists)
            throw new BusinessException(message);
    }

    public static Expression<Func<TEntity, bool>> UniqueCodigoPredicate<TEntity>(
        string codigo,
        Guid? currentId)
        where TEntity : Entity, ICodedEntity
    {
        if (currentId is { } id)
            return x => x.Codigo == codigo && x.Id != id;

        return x => x.Codigo == codigo;
    }
}
