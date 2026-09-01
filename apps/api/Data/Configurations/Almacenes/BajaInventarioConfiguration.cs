using Clinica.Api.Modules.Almacenes.BajaInventario.Entity;
using Clinica.Api.Modules.Almacenes.BajaInventario.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class BajaInventarioConfiguration
    : AuditableEntityConfiguration<BajaInventario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<BajaInventario> builder)
    {
        builder.ToTable("BajasInventario");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Motivo)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoBajaInventario.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.MotivoAnulacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.BajaInventario)
            .HasForeignKey(x => x.BajaInventarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}