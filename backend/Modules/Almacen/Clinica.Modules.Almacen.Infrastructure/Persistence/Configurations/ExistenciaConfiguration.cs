using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class ExistenciaConfiguration : BaseEntityConfiguration<Existencia>
{
    public override void Configure(EntityTypeBuilder<Existencia> builder)
    {
        base.Configure(builder);
        builder.ToTable("Existencias");
        builder.Property(x => x.Cantidad).HasPrecision(18, 4);
        builder.HasIndex(x => x.LoteId).IsUnique();
        builder.HasIndex(x => x.ProductoId);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany(x => x.Existencias)
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithOne(x => x.Existencia)
            .HasForeignKey<Existencia>(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
