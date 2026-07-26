using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence;

public class LaboratorioDbContext : DbContext
{
    public LaboratorioDbContext(DbContextOptions<LaboratorioDbContext> options)
        : base(options)
    {
    }

    public DbSet<Especialidad> Especialidades => Set<Especialidad>();
    public DbSet<TipoExamen> TiposExamen => Set<TipoExamen>();
    public DbSet<Prueba> Pruebas => Set<Prueba>();
    public DbSet<PruebaPrecio> PruebaPrecios => Set<PruebaPrecio>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("laboratorio");
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LaboratorioDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CatalogoGrupo>(entity =>
        {
            entity.ToTable("CatalogoGrupos", "parametros", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<CatalogoItem>(entity =>
        {
            entity.ToTable("CatalogoItems", "parametros", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.CatalogoGrupo);
        });
    }
}
