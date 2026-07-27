using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Persistence;

public class CajaDbContext : DbContext
{
    public CajaDbContext(DbContextOptions<CajaDbContext> options)
        : base(options)
    {
    }

    public DbSet<CajaFisica> Cajas => Set<CajaFisica>();
    public DbSet<TurnoCaja> TurnosCaja => Set<TurnoCaja>();
    public DbSet<MetodoPago> MetodosPago => Set<MetodoPago>();
    public DbSet<ConceptoCaja> ConceptosCaja => Set<ConceptoCaja>();
    public DbSet<Cuenta> Cuentas => Set<Cuenta>();
    public DbSet<Cargo> Cargos => Set<Cargo>();
    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<PagoDetalle> PagosDetalle => Set<PagoDetalle>();
    public DbSet<AplicacionPago> AplicacionesPago => Set<AplicacionPago>();
    public DbSet<MovimientoCaja> MovimientosCaja => Set<MovimientoCaja>();
    public DbSet<Recibo> Recibos => Set<Recibo>();
    public DbSet<ArqueoCaja> ArqueosCaja => Set<ArqueoCaja>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("caja");
        ConfigureExternalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CajaDbContext).Assembly);
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

        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.ToTable("Pacientes", "personas", t => t.ExcludeFromMigrations());
            entity.HasKey(x => x.Id);
            entity.HasOne(x => x.Persona)
                .WithMany()
                .HasForeignKey(x => x.PersonaId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
