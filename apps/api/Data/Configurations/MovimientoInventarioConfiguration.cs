using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class MovimientoInventarioConfiguration
    : AuditableEntityConfiguration<MovimientoInventario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<MovimientoInventario> builder)
    {
        builder.ToTable("MovimientosInventario");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.FechaMovimiento)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoMovimientoInventario.Borrador);

        builder.Property(x => x.ReferenciaTipo)
            .HasMaxLength(30);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.MotivoAnulacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.TipoMovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.TipoMovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.MovimientoInventario)
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
