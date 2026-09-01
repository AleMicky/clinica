using Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class ConsumoInternoConfiguration
    : AuditableEntityConfiguration<ConsumoInterno>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ConsumoInterno> builder)
    {
        builder.ToTable("ConsumosInterno");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.ReferenciaTipo)
            .HasMaxLength(30);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoConsumoInterno.Borrador)
            .HasSentinel(0);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Area)
            .WithMany()
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.ConsumoInterno)
            .HasForeignKey(x => x.ConsumoInternoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}