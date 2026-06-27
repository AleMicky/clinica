using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Persistence;

public class PersonasDbContext : DbContext
{
    public PersonasDbContext(DbContextOptions<PersonasDbContext> options)
        : base(options)
    {
    }

    public DbSet<Persona> Personas => Set<Persona>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<Medico> Medicos => Set<Medico>();
    public DbSet<ContactoEmergencia> ContactosEmergencia => Set<ContactoEmergencia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PersonasDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CatalogoGrupo>(entity =>
        {
            entity.ToTable("CatalogoGrupos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<CatalogoItem>(entity =>
        {
            entity.ToTable("CatalogoItems", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.CatalogoGrupo);
        });

        modelBuilder.Entity<Area>(entity =>
        {
            entity.ToTable("Areas", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Departamentos);
        });

        modelBuilder.Entity<Departamento>(entity =>
        {
            entity.ToTable("Departamentos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Area);
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.ToTable("Servicios", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Profesion>(entity =>
        {
            entity.ToTable("Profesiones", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Cargo>(entity =>
        {
            entity.ToTable("Cargos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Especialidad>(entity =>
        {
            entity.ToTable("Especialidades", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });
    }
}
