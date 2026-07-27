using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class PagoDetalleConfiguration : BaseEntityConfiguration<PagoDetalle>
{
    public override void Configure(EntityTypeBuilder<PagoDetalle> builder)
    {
        base.Configure(builder);

        builder.ToTable("PagosDetalle");

        builder.Property(x => x.Importe).HasPrecision(18, 2);
        builder.Property(x => x.NumeroReferencia).HasMaxLength(100);
        builder.Property(x => x.Observaciones).HasMaxLength(1000);

        builder.HasOne(x => x.Pago)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.PagoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.MetodoPago)
            .WithMany()
            .HasForeignKey(x => x.MetodoPagoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
