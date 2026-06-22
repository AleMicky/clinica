using Clinica.Modules.Seguridad.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Seguridad.Infrastructure.Persistence;

public class ClinicaDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ClinicaDbContext(DbContextOptions<ClinicaDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.NombreCompleto).HasMaxLength(200).IsRequired();
            entity.Property(u => u.Activo).HasDefaultValue(true);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        builder.Entity<ApplicationRole>(entity =>
        {
            entity.Property(r => r.Descripcion).HasMaxLength(500);
        });

        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
    }
}
