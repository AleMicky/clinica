using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class CuentaConfiguration : BaseEntityConfiguration<Cuenta>
{
    public override void Configure(EntityTypeBuilder<Cuenta> builder)
    {
        base.Configure(builder);

        builder.ToTable("Cuentas");

        builder.Property(x => x.Numero)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.Property(x => x.PacienteId)
            .IsRequired();

        builder.HasOne<Paciente>()
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.ModuloOrigen)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.EntidadOrigen)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.TotalCargos)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalPagado)
            .HasPrecision(18, 2);

        builder.Property(x => x.Saldo)
            .HasPrecision(18, 2);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(2000);

        builder.HasIndex(x => new { x.ModuloOrigen, x.EntidadOrigen, x.ReferenciaId });
        builder.HasIndex(x => x.PacienteId);
        builder.HasIndex(x => x.Estado);

        builder.HasMany(x => x.Cargos)
            .WithOne(x => x.Cuenta)
            .HasForeignKey(x => x.CuentaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Pagos)
            .WithOne(x => x.Cuenta)
            .HasForeignKey(x => x.CuentaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
