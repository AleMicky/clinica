using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class TransferenciaAlmacenDetalleConfiguration : BaseEntityConfiguration<TransferenciaAlmacenDetalle>
{
    public override void Configure(EntityTypeBuilder<TransferenciaAlmacenDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("TransferenciasAlmacenDetalle");
        builder.Property(x => x.CantidadSolicitada).HasPrecision(18, 4);
        builder.Property(x => x.CantidadEnviada).HasPrecision(18, 4);
        builder.Property(x => x.CantidadRecibida).HasPrecision(18, 4);
        builder.Property(x => x.Observacion).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductoLoteOrigen)
            .WithMany()
            .HasForeignKey(x => x.ProductoLoteOrigenId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
