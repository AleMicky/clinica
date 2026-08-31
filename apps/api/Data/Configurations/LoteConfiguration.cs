using Clinica.Api.Modules.Almacenes.Lote.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class LoteConfiguration
    : AuditableEntityConfiguration<Lote>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Lote> builder)
    {
        builder.ToTable("Lotes");

        builder.Property(x => x.NumeroLote)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CostoUnitario)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new { x.ProductoId, x.NumeroLote })
            .IsUnique();

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
