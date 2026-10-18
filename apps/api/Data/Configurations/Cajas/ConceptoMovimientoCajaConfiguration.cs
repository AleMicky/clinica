using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Cajas;

public sealed class ConceptoMovimientoCajaConfiguration
    : AuditableEntityConfiguration<ConceptoMovimientoCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ConceptoMovimientoCaja> builder)
    {
        builder.ToTable("ConceptosMovimientoCaja");

        builder.Property(x => x.TipoMovimientoCajaId)
            .IsRequired();

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.HasIndex(x => new { x.TipoMovimientoCajaId, x.Codigo })
            .IsUnique();

        builder.HasOne(x => x.TipoMovimientoCaja)
            .WithMany(x => x.Conceptos)
            .HasForeignKey(x => x.TipoMovimientoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Movimientos)
            .WithOne(x => x.ConceptoMovimientoCaja)
            .HasForeignKey(x => x.ConceptoMovimientoCajaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
