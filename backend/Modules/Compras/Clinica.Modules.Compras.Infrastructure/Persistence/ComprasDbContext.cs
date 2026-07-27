using Clinica.Modules.Compras.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Compras.Infrastructure.Persistence;

public class ComprasDbContext : DbContext
{
    public ComprasDbContext(DbContextOptions<ComprasDbContext> options) : base(options) { }

    public DbSet<Proveedor> Proveedores => Set<Proveedor>();
    public DbSet<OrdenCompra> OrdenesCompra => Set<OrdenCompra>();
    public DbSet<OrdenCompraDetalle> OrdenesCompraDetalle => Set<OrdenCompraDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("compras");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ComprasDbContext).Assembly);
    }
}
