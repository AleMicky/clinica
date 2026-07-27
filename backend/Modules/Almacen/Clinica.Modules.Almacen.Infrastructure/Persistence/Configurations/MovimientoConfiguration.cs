using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class MovimientoConfiguration : BaseEntityConfiguration<Movimiento>
{
    public override void Configure(EntityTypeBuilder<Movimiento> builder)
    {
        base.Configure(builder);
        builder.ToTable("Movimientos");
        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.Property(x => x.Tipo).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Estado).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Observaciones).HasMaxLength(1000);
        builder.Property(x => x.ModuloOrigen).HasMaxLength(100);
        builder.Property(x => x.EntidadOrigen).HasMaxLength(100);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.Movimiento)
            .HasForeignKey(x => x.MovimientoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
