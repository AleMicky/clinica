using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class LoteConfiguration : BaseEntityConfiguration<Lote>
{
    public override void Configure(EntityTypeBuilder<Lote> builder)
    {
        base.Configure(builder);
        builder.ToTable("Lotes");
        builder.Property(x => x.Numero).HasMaxLength(100).IsRequired();
        builder.HasIndex(x => new { x.ProductoId, x.Numero }).IsUnique();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Producto)
            .WithMany(x => x.Lotes)
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
