using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.Parametros.Domain.Entities;
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
    public DbSet<Atencion> Atenciones => Set<Atencion>();
    public DbSet<AtencionFormularioRespuesta> AtencionFormularioRespuestas => Set<AtencionFormularioRespuesta>();
    public DbSet<Diagnostico> Diagnosticos => Set<Diagnostico>();
    public DbSet<DiagnosticoAtencion> DiagnosticoAtenciones => Set<DiagnosticoAtencion>();
    public DbSet<SignoVital> SignosVitales => Set<SignoVital>();
    public DbSet<Tratamiento> Tratamientos => Set<Tratamiento>();
    public DbSet<Estudio> Estudios => Set<Estudio>();
    public DbSet<ResultadoEstudio> ResultadosEstudio => Set<ResultadoEstudio>();
    public DbSet<Interconsulta> Interconsultas => Set<Interconsulta>();
    public DbSet<Prescripcion> Prescripciones => Set<Prescripcion>();
    public DbSet<PrescripcionDetalle> PrescripcionDetalles => Set<PrescripcionDetalle>();

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

        modelBuilder.Entity<CatalogoItem>(entity =>
        {
            entity.ToTable("CatalogoItems", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.CatalogoGrupo);
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
            entity.Ignore(x => x.Especialidad);
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.ToTable("Servicios", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.Ignore(x => x.Departamento);
        });
    }
}
