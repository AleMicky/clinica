using Clinica.Modules.Laboratorio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence;

public class LaboratorioDbContext : DbContext
{
    public LaboratorioDbContext(DbContextOptions<LaboratorioDbContext> options)
        : base(options)
    {
    }

    public DbSet<Especialidad> Especialidades => Set<Especialidad>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("laboratorio");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LaboratorioDbContext).Assembly);
    }
}
