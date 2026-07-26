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
    public DbSet<Medico> Medicos => Set<Medico>();
    public DbSet<MedicoEspecialidad> MedicoEspecialidades => Set<MedicoEspecialidad>();
    public DbSet<ContactoEmergencia> ContactosEmergencia => Set<ContactoEmergencia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("personas");
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PersonasDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CatalogoGrupo>(entity =>
        {
            entity.ToTable("CatalogoGrupos", "parametros", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<CatalogoItem>(entity =>
        {
            entity.ToTable("CatalogoItems", "parametros", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.CatalogoGrupo);
        });

        modelBuilder.Entity<Area>(entity =>
        {
            entity.ToTable("Areas", "recursos_humanos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Profesion>(entity =>
        {
            entity.ToTable("Profesiones", "recursos_humanos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Cargo>(entity =>
        {
            entity.ToTable("Cargos", "recursos_humanos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Especialidad>(entity =>
        {
            entity.ToTable("Especialidades", "recursos_humanos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.ToTable("Empleados", "recursos_humanos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Area);
            entity.Ignore(x => x.Profesion);
            entity.Ignore(x => x.Cargo);
        });
    }
}
