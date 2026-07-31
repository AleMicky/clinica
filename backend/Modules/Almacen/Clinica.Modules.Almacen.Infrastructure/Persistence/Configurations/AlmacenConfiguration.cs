using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlmacenEntity = Clinica.Modules.Almacen.Domain.Entities.Almacen;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class AlmacenConfiguration : BaseEntityConfiguration<AlmacenEntity>
{
    public override void Configure(EntityTypeBuilder<AlmacenEntity> builder)
    {
        base.Configure(builder);
        builder.ToTable("Almacenes");
        builder.Property(x => x.Codigo).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Codigo).IsUnique();
        builder.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Descripcion).HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.TipoAlmacen)
            .WithMany(x => x.Almacenes)
            .HasForeignKey(x => x.TipoAlmacenId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
