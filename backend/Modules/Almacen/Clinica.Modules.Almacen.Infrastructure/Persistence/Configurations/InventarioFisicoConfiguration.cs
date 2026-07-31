using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class InventarioFisicoConfiguration : BaseEntityConfiguration<InventarioFisico>
{
    public override void Configure(EntityTypeBuilder<InventarioFisico> builder)
    {
        base.Configure(builder);
        builder.ToTable("InventariosFisicos");
        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.Property(x => x.Observacion).HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.InventarioFisico)
            .HasForeignKey(x => x.InventarioFisicoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
