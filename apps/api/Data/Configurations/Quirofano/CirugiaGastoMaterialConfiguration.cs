using Clinica.Api.Modules.Quirofano.Cirugia.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Quirofano;

public class CirugiaGastoMaterialConfiguration : IEntityTypeConfiguration<CirugiaGastoMaterial>
{
    public void Configure(EntityTypeBuilder<CirugiaGastoMaterial> builder)
    {
        builder.ToTable("Quirofano_CirugiasGastosMateriales");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2);

        builder.Property(x => x.CostoUnitario)
            .HasPrecision(18, 2);

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 2);

        builder.Property(x => x.MomentoQuirurgico)
            .HasMaxLength(100);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(300);

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

