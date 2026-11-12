using Clinica.Api.Modules.Farmacia.Dispensacion.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Farmacia;

public class DispensacionDetalleConfiguration : IEntityTypeConfiguration<DispensacionDetalle>
{
    public void Configure(EntityTypeBuilder<DispensacionDetalle> builder)
    {
        builder.ToTable("Farmacia_DispensacionesDetalles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Lote)
            .HasMaxLength(100);

        builder.Property(x => x.Indicaciones)
            .HasMaxLength(500);

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 4);

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 4);

        builder.Property(x => x.Descuento)
            .HasPrecision(18, 2);

        builder.Property(x => x.Total)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PartidaInventario)
            .WithMany()
            .HasForeignKey(x => x.PartidaInventarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

