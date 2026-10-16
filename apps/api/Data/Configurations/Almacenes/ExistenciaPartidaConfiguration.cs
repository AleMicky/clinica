using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class ExistenciaPartidaConfiguration
    : AuditableEntityConfiguration<ExistenciaPartida>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ExistenciaPartida> builder)
    {
        builder.ToTable("ExistenciasPartidas");

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CantidadReservada)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(x => new { x.ExistenciaId, x.PartidaInventarioId })
            .IsUnique();

        builder.HasOne(x => x.Existencia)
            .WithMany(x => x.ExistenciasPartidas)
            .HasForeignKey(x => x.ExistenciaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PartidaInventario)
            .WithMany(x => x.ExistenciasPartidas)
            .HasForeignKey(x => x.PartidaInventarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
