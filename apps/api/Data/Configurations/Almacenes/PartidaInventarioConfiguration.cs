using Clinica.Api.Modules.Almacenes.PartidaInventario.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class PartidaInventarioConfiguration
    : AuditableEntityConfiguration<PartidaInventario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<PartidaInventario> builder)
    {
        builder.ToTable("PartidasInventario");

        builder.Property(x => x.NumeroPartida)
            .HasMaxLength(50);

        builder.Property(x => x.CostoUnitario)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new { x.ProductoId, x.NumeroPartida })
            .HasFilter("[NumeroPartida] IS NOT NULL");

        builder.HasOne(x => x.Producto)
            .WithMany(x => x.PartidasInventario)
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
