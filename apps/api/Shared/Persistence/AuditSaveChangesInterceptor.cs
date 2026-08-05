using Clinica.Api.Shared.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Clinica.Api.Shared.Persistence;

public sealed class AuditSaveChangesInterceptor(
    ICurrentUserService current) : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ApplyAudit(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        ApplyAudit(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    private void ApplyAudit(DbContext? context)
    {
        if (context is null)
            return;

        var now = DateTime.UtcNow;
        var user = current.UserName;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.FechaCreacion = now;
                    if (user is not null)
                        entry.Entity.CreadoPor = user;
                    break;

                case EntityState.Modified:
                    entry.Entity.FechaModificacion = now;
                    if (user is not null)
                        entry.Entity.ModificadoPor = user;
                    break;
            }
        }
    }
}