using Clinica.Api.Modules.Parametros.Catalogo;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Parametros.UnidadesMedida;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Modules.Seguridad.Usuarios;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data;

public class AppDbContext(
    DbContextOptions<AppDbContext> options)
    : IdentityDbContext<Usuario, Rol, int>(options)
{
    public DbSet<CatalogoGrupo> CatalogosGrupos => Set<CatalogoGrupo>();

    public DbSet<CatalogoItem> CatalogosItems => Set<CatalogoItem>();

    public DbSet<UnidadesMedida> UnidadesMedida => Set<UnidadesMedida>();

    public DbSet<Moneda> Monedas => Set<Moneda>();

    public DbSet<TipoCambio> TiposCambio => Set<TipoCambio>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        ConfigurarTablasIdentity(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    private static void ConfigurarTablasIdentity(ModelBuilder builder)
    {
        builder.Entity<Usuario>().ToTable("Usuarios");
        builder.Entity<Rol>().ToTable("Roles");

        builder.Entity<IdentityUserRole<int>>()
            .ToTable("UsuariosRoles");

        builder.Entity<IdentityUserClaim<int>>()
            .ToTable("UsuariosClaims");

        builder.Entity<IdentityUserLogin<int>>()
            .ToTable("UsuariosLogins");

        builder.Entity<IdentityRoleClaim<int>>()
            .ToTable("RolesClaims");

        builder.Entity<IdentityUserToken<int>>()
            .ToTable("UsuariosTokens");
    }
}