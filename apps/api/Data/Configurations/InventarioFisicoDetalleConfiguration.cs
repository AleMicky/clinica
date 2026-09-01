using Clinica.Api.Modules.Almacenes.InventarioFisico.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class InventarioFisicoDetalleConfiguration
    : AuditableEntityConfiguration<InventarioFisicoDetalle>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<InventarioFisicoDetalle> builder)
    {
        builder.ToTable("InventariosFisicosDetalles");

        builder.Property(x => x.CantidadSistema)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadContada)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Lote)
            .WithMany()
            .HasForeignKey(x => x.LoteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.InventarioFisico)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.InventarioFisicoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}