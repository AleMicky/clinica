using Clinica.Modules.Personas.Domain.Entities;
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
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RecursosHumanosDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Clinica.Modules.Personas.Domain.Entities.MedicoEspecialidad>(entity =>
        {
            entity.ToTable("MedicoEspecialidades", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Medico);
            entity.Ignore(x => x.Especialidad);
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.ToTable("Empleados", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Persona);
            entity.Ignore(x => x.Area);
            entity.Ignore(x => x.Departamento);
            entity.Ignore(x => x.Servicio);
            entity.Ignore(x => x.Profesion);
            entity.Ignore(x => x.Cargo);
        });
    }
}
