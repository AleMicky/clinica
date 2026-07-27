using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class MuestraConfiguration : BaseEntityConfiguration<Muestra>
{
    public override void Configure(EntityTypeBuilder<Muestra> builder)
    {
        base.Configure(builder);

        builder.ToTable("Muestras");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Observaciones)
            .HasMaxLength(1000);

        builder.HasOne(x => x.Solicitud)
            .WithMany(x => x.Muestras)
            .HasForeignKey(x => x.SolicitudId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TipoMuestra)
            .WithMany()
            .HasForeignKey(x => x.TipoMuestraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SolicitudId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
