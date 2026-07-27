using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class PagoConfiguration : BaseEntityConfiguration<Pago>
{
    public override void Configure(EntityTypeBuilder<Pago> builder)
    {
        base.Configure(builder);

        builder.ToTable("Pagos");

        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();

        builder.Property(x => x.Monto).HasPrecision(18, 2);
        builder.Property(x => x.MetodoPago).HasMaxLength(50);
        builder.Property(x => x.Estado).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Observaciones).HasMaxLength(2000);

        builder.HasIndex(x => x.CuentaId);
        builder.HasIndex(x => x.TurnoCajaId);
        builder.HasIndex(x => x.FechaPago);
        builder.HasIndex(x => x.PacienteId);

        builder.HasOne(x => x.TurnoCaja)
            .WithMany(x => x.Pagos)
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
