using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class TransferenciaAlmacenConfiguration : BaseEntityConfiguration<TransferenciaAlmacen>
{
    public override void Configure(EntityTypeBuilder<TransferenciaAlmacen> builder)
    {
        base.Configure(builder);
        builder.ToTable("TransferenciasAlmacen");
        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.Property(x => x.Observacion).HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.AlmacenOrigen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenOrigenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AlmacenDestino)
            .WithMany()
            .HasForeignKey(x => x.AlmacenDestinoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.TransferenciaAlmacen)
            .HasForeignKey(x => x.TransferenciaAlmacenId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
