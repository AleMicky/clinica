using Clinica.Api.Modules.Almacenes.ReservaStock.Entity;
using Clinica.Api.Modules.Almacenes.ReservaStock.Enums;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Almacenes;

public sealed class ReservaStockConfiguration
    : AuditableEntityConfiguration<ReservaStock>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<ReservaStock> builder)
    {
        builder.ToTable("ReservasStock");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.ReferenciaTipo)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.FechaReserva)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoReservaStock.Borrador)
            .HasSentinel(0);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.ReservaStock)
            .HasForeignKey(x => x.ReservaStockId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
