using Clinica.Api.Modules.Almacenes.InventarioFisico.Entity;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Enums;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class InventarioFisicoConfiguration
    : AuditableEntityConfiguration<InventarioFisico>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<InventarioFisico> builder)
    {
        builder.ToTable("InventariosFisicos");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaCierre);

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoInventarioFisico.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<MovimientoInventario>()
            .WithMany()
            .HasForeignKey(x => x.MovimientoAjustePositivoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<MovimientoInventario>()
            .WithMany()
            .HasForeignKey(x => x.MovimientoAjusteNegativoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.InventarioFisico)
            .HasForeignKey(x => x.InventarioFisicoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}