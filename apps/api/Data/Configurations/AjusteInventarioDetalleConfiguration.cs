using Clinica.Api.Modules.Almacenes.AjusteInventario.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class AjusteInventarioDetalleConfiguration
    : AuditableEntityConfiguration<AjusteInventarioDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<AjusteInventarioDetalle> builder)
    {
        builder.ToTable("AjustesInventarioDetalles");

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

        builder.HasOne(x => x.AjusteInventario)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.AjusteInventarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
