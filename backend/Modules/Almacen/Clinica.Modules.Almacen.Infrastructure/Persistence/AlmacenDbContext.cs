using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence;

public class AlmacenDbContext : DbContext
{
    public AlmacenDbContext(DbContextOptions<AlmacenDbContext> options)
        : base(options)
    {
    }

    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Lote> Lotes => Set<Lote>();
    public DbSet<Existencia> Existencias => Set<Existencia>();
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();
    public DbSet<MovimientoDetalle> MovimientoDetalles => Set<MovimientoDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("almacen");
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AlmacenDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UnidadesMedida>(entity =>
        {
            entity.ToTable("UnidadesMedida", "parametros", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });
    }
}
