using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class SolicitudPagoConfiguration : BaseEntityConfiguration<SolicitudPago>
{
    public override void Configure(EntityTypeBuilder<SolicitudPago> builder)
    {
        base.Configure(builder);

        builder.ToTable("SolicitudPagos");

        builder.Property(x => x.MontoTotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasOne(x => x.Solicitud)
            .WithMany(x => x.Pagos)
            .HasForeignKey(x => x.SolicitudId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SolicitudId);
        builder.HasIndex(x => x.CuentaId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
