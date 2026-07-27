using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class AplicacionPagoConfiguration : BaseEntityConfiguration<AplicacionPago>
{
    public override void Configure(EntityTypeBuilder<AplicacionPago> builder)
    {
        base.Configure(builder);

        builder.ToTable("AplicacionesPago");

        builder.Property(x => x.ImporteAplicado).HasPrecision(18, 2);

        builder.HasIndex(x => x.CuentaId);
        builder.HasIndex(x => x.PagoId);

        builder.HasOne(x => x.Pago)
            .WithMany(x => x.Aplicaciones)
            .HasForeignKey(x => x.PagoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Cuenta)
            .WithMany()
            .HasForeignKey(x => x.CuentaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
