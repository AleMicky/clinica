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

    public DbSet<TipoArea> TiposArea => Set<TipoArea>();

    public DbSet<Cargo> Cargos => Set<Cargo>();

    public DbSet<Profesion> Profesiones => Set<Profesion>();

    public DbSet<Especialidad> Especialidades => Set<Especialidad>();

    public DbSet<Empleado> Empleados => Set<Empleado>();

    public DbSet<Turno> Turnos => Set<Turno>();

    public DbSet<GrupoProgramacion> GrupoProgramacion => Set<GrupoProgramacion>();

    public DbSet<Programacion> Programacion => Set<Programacion>();

    public DbSet<GrupoProgramacionEmpleado> GrupoProgramacionEmpleado => Set<GrupoProgramacionEmpleado>();

    public DbSet<ProgramacionDiaria> ProgramacionDiaria => Set<ProgramacionDiaria>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("recursos_humanos");
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RecursosHumanosDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Persona>(entity =>
        {
            entity.ToTable("Personas", "personas", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.TipoDocumento);
            entity.Ignore(x => x.ExtensionDocumento);
            entity.Ignore(x => x.Sexo);
            entity.Ignore(x => x.EstadoCivil);
            entity.Ignore(x => x.ContactosEmergencia);
        });

        modelBuilder.Entity<MedicoEspecialidad>(entity =>
        {
            entity.ToTable("MedicoEspecialidades", "personas", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Medico);
            entity.Ignore(x => x.Especialidad);
        });
    }
}
