using Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class ConsumoInternoDetalleConfiguration
    : AuditableEntityConfiguration<ConsumoInternoDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ConsumoInternoDetalle> builder)
    {
        builder.ToTable("ConsumosInternoDetalles");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ConsumoInterno)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.ConsumoInternoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}