using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class InventarioFisicoDetalleConfiguration : BaseEntityConfiguration<InventarioFisicoDetalle>
{
    public override void Configure(EntityTypeBuilder<InventarioFisicoDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("InventariosFisicoDetalle");
        builder.Property(x => x.CantidadSistema).HasPrecision(18, 4);
        builder.Property(x => x.CantidadContada).HasPrecision(18, 4);
        builder.Property(x => x.Observacion).HasMaxLength(500);
        builder.Ignore(x => x.Diferencia);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductoLote)
            .WithMany()
            .HasForeignKey(x => x.ProductoLoteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
