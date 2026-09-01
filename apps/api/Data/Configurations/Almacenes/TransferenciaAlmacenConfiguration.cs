using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class TransferenciaAlmacenConfiguration
    : AuditableEntityConfiguration<TransferenciaAlmacen>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<TransferenciaAlmacen> builder)
    {
        builder.ToTable("TransferenciasAlmacen");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.FechaSolicitud)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoTransferenciaAlmacen.Borrador)
            .HasSentinel(0);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.AlmacenOrigen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenOrigenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AlmacenDestino)
            .WithMany()
            .HasForeignKey(x => x.AlmacenDestinoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.TransferenciaAlmacen)
            .HasForeignKey(x => x.TransferenciaAlmacenId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
