using Clinica.Modules.Farmacia.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Farmacia.Infrastructure.Persistence;

public class FarmaciaDbContext : DbContext
{
    public FarmaciaDbContext(DbContextOptions<FarmaciaDbContext> options) : base(options) { }

    public DbSet<Precio> Precios => Set<Precio>();
    public DbSet<Receta> Recetas => Set<Receta>();
    public DbSet<RecetaDetalle> RecetaDetalles => Set<RecetaDetalle>();
    public DbSet<Dispensacion> Dispensaciones => Set<Dispensacion>();
    public DbSet<DispensacionDetalle> DispensacionDetalles => Set<DispensacionDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("farmacia");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FarmaciaDbContext).Assembly);
    }
}
