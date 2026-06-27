using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;

public class RecursosHumanosDbContext : DbContext
{
    public RecursosHumanosDbContext(DbContextOptions<RecursosHumanosDbContext> options)
        : base(options)
    {
    }

    public DbSet<Area> Areas => Set<Area>();

    public DbSet<Cargo> Cargos => Set<Cargo>();

    public DbSet<Profesion> Profesiones => Set<Profesion>();

    public DbSet<Especialidad> Especialidades => Set<Especialidad>();

    public DbSet<Departamento> Departamentos => Set<Departamento>();

    public DbSet<Servicio> Servicios => Set<Servicio>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RecursosHumanosDbContext).Assembly);
    }
}
