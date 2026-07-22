using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence;

public class AtencionMedicaDbContext : DbContext
{
    public AtencionMedicaDbContext(DbContextOptions<AtencionMedicaDbContext> options)
        : base(options)
    {
    }

    public DbSet<TipoAtencion> TiposAtencion => Set<TipoAtencion>();
    public DbSet<TipoCampoFormulario> TiposCampoFormulario => Set<TipoCampoFormulario>();
    public DbSet<FormularioClinico> FormulariosClinicos => Set<FormularioClinico>();
    public DbSet<FormularioSeccion> FormularioSecciones => Set<FormularioSeccion>();
    public DbSet<FormularioCampo> FormularioCampos => Set<FormularioCampo>();
    public DbSet<NumeracionAtencion> NumeracionesAtencion => Set<NumeracionAtencion>();
    public DbSet<Atencion> Atenciones => Set<Atencion>();
    public DbSet<AtencionFormularioRespuesta> AtencionFormularioRespuestas => Set<AtencionFormularioRespuesta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AtencionMedicaDbContext).Assembly);
    }

    private static void ConfigureExternalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.ToTable("Pacientes", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Persona);
            entity.Ignore(x => x.GrupoSanguineo);
        });

        modelBuilder.Entity<Especialidad>(entity =>
        {
            entity.ToTable("Especialidades", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Medico>(entity =>
        {
            entity.ToTable("Medicos", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Empleado);
            entity.Ignore(x => x.Especialidades);
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.ToTable("Servicios", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Departamento);
        });
    }
}
