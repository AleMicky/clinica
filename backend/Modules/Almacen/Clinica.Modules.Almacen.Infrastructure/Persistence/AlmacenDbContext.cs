using Clinica.Modules.Almacen.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Modules.Almacen.Domain.Entities.Almacen;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence;

public class AlmacenDbContext : DbContext
{
    public AlmacenDbContext(DbContextOptions<AlmacenDbContext> options)
        : base(options)
    {
    }

    public DbSet<TipoAlmacen> TiposAlmacen => Set<TipoAlmacen>();
    public DbSet<AlmacenEntity> Almacenes => Set<AlmacenEntity>();
    public DbSet<CategoriaProducto> CategoriasProducto => Set<CategoriaProducto>();
    public DbSet<UnidadMedida> UnidadesMedida => Set<UnidadMedida>();
    public DbSet<FormaFarmaceutica> FormasFarmaceuticas => Set<FormaFarmaceutica>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<MedicamentoDetalle> MedicamentosDetalle => Set<MedicamentoDetalle>();
    public DbSet<ProductoStock> ProductosStock => Set<ProductoStock>();
    public DbSet<ProductoLote> ProductosLote => Set<ProductoLote>();
    public DbSet<TipoMovimientoAlmacen> TiposMovimientoAlmacen => Set<TipoMovimientoAlmacen>();
    public DbSet<MovimientoAlmacen> MovimientosAlmacen => Set<MovimientoAlmacen>();
    public DbSet<MovimientoAlmacenDetalle> MovimientosAlmacenDetalle => Set<MovimientoAlmacenDetalle>();
    public DbSet<TransferenciaAlmacen> TransferenciasAlmacen => Set<TransferenciaAlmacen>();
    public DbSet<TransferenciaAlmacenDetalle> TransferenciasAlmacenDetalle => Set<TransferenciaAlmacenDetalle>();
    public DbSet<SolicitudAlmacen> SolicitudesAlmacen => Set<SolicitudAlmacen>();
    public DbSet<SolicitudAlmacenDetalle> SolicitudesAlmacenDetalle => Set<SolicitudAlmacenDetalle>();
    public DbSet<InventarioFisico> InventariosFisicos => Set<InventarioFisico>();
    public DbSet<InventarioFisicoDetalle> InventariosFisicoDetalle => Set<InventarioFisicoDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("almacen");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AlmacenDbContext).Assembly);
    }
}
