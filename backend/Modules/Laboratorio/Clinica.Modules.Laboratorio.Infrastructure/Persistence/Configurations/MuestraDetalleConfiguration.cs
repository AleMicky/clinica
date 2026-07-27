using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class MuestraDetalleConfiguration : BaseEntityConfiguration<MuestraDetalle>
{
    public override void Configure(EntityTypeBuilder<MuestraDetalle> builder)
    {
        base.Configure(builder);

        builder.ToTable("MuestraDetalles");

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasOne(x => x.Muestra)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.MuestraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SolicitudDetalle)
            .WithMany()
            .HasForeignKey(x => x.SolicitudDetalleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.MuestraId);
        builder.HasIndex(x => x.SolicitudDetalleId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
