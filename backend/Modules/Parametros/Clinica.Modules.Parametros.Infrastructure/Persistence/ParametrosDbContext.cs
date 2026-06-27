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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ParametrosDbContext).Assembly);
    }
}
