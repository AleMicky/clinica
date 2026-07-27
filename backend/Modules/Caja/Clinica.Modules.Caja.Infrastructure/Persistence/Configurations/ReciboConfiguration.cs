using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class ReciboConfiguration : BaseEntityConfiguration<Recibo>
{
    public override void Configure(EntityTypeBuilder<Recibo> builder)
    {
        base.Configure(builder);

        builder.ToTable("Recibos");

        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.Property(x => x.Importe).HasPrecision(18, 2);
        builder.Property(x => x.Estado).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Observaciones).HasMaxLength(2000);

        builder.HasOne(x => x.Pago)
            .WithOne(x => x.Recibo)
            .HasForeignKey<Recibo>(x => x.PagoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
