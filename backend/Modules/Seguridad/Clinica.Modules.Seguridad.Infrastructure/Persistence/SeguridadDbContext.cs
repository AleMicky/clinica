using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Seguridad.Infrastructure.Persistence;

public sealed class SeguridadDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public SeguridadDbContext(
        DbContextOptions<SeguridadDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.NombreCompleto).HasMaxLength(200).IsRequired();
            entity.Property(u => u.PersonaId);
            entity.HasIndex(u => u.PersonaId).IsUnique().HasFilter("[PersonaId] IS NOT NULL");
            entity.Property(u => u.Activo).HasDefaultValue(true);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        builder.Entity<ApplicationRole>(entity => { entity.Property(r => r.Descripcion).HasMaxLength(500); });

        builder.HasDefaultSchema("seguridad");
        builder.Entity<ApplicationUser>().ToTable("usuarios");
        builder.Entity<ApplicationRole>().ToTable("roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("usuarios_roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("usuarios_claims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("usuarios_logins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("roles_claims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("usuarios_tokens");
    }
}