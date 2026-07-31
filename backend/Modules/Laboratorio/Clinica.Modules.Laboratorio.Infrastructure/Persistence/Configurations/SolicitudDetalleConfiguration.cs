using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class SolicitudDetalleConfiguration : BaseEntityConfiguration<SolicitudDetalle>
{
    public override void Configure(EntityTypeBuilder<SolicitudDetalle> builder)
    {
        base.Configure(builder);

        builder.ToTable("SolicitudDetalles");

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Observaciones)
            .HasMaxLength(500);

        builder.HasOne(x => x.Solicitud)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.SolicitudId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Prueba)
            .WithMany()
            .HasForeignKey(x => x.PruebaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SolicitudId);
        builder.HasIndex(x => x.PruebaId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
