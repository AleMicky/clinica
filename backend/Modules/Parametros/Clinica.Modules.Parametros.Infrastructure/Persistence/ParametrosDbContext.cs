using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence;

public class ParametrosDbContext : DbContext
{
    public ParametrosDbContext(DbContextOptions<ParametrosDbContext> options)
        : base(options)
    {
    }

    public DbSet<CatalogoGrupo> CatalogoGrupos => Set<CatalogoGrupo>();

    public DbSet<CatalogoItem> CatalogoItems => Set<CatalogoItem>();

    public DbSet<Correlativo> Correlativos => Set<Correlativo>();

    public DbSet<UnidadesMedida> UnidadesMedida => Set<UnidadesMedida>();

    public DbSet<Gestion> Gestiones => Set<Gestion>();

    public DbSet<Periodo> Periodos => Set<Periodo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("parametros");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ParametrosDbContext).Assembly);
    }
}
