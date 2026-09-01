using Clinica.Api.Modules.Almacenes.AjusteInventario.Entity;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class AjusteInventarioConfiguration
    : AuditableEntityConfiguration<AjusteInventario>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<AjusteInventario> builder)
    {
        builder.ToTable("AjustesInventario");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Motivo)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoAjusteInventario.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.MotivoAnulacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.AjusteInventario)
            .HasForeignKey(x => x.AjusteInventarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
