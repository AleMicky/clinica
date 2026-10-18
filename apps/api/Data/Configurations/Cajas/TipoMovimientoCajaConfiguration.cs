using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Cajas;

public sealed class TipoMovimientoCajaConfiguration
    : AuditableEntityConfiguration<TipoMovimientoCaja>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TipoMovimientoCaja> builder)
    {
        builder.ToTable("TiposMovimientoCaja");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.Property(x => x.Naturaleza)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasMany(x => x.Conceptos)
            .WithOne(x => x.TipoMovimientoCaja)
            .HasForeignKey(x => x.TipoMovimientoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Movimientos)
            .WithOne(x => x.TipoMovimientoCaja)
            .HasForeignKey(x => x.TipoMovimientoCajaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
