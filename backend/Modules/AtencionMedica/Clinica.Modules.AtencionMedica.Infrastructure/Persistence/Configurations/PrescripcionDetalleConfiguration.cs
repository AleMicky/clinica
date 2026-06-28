using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class PrescripcionDetalleConfiguration : BaseEntityConfiguration<PrescripcionDetalle>
{
    public override void Configure(EntityTypeBuilder<PrescripcionDetalle> builder)
    {
        base.Configure(builder);

        builder.ToTable("PrescripcionDetalles");

        builder.Property(x => x.PrescripcionId)
            .IsRequired();

        builder.HasOne(x => x.Prescripcion)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.PrescripcionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.MedicamentoNombre)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(x => x.Dosis)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Frecuencia)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Duracion)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ViaAdministracion)
            .HasMaxLength(50);

        builder.Property(x => x.Indicaciones)
            .HasMaxLength(500);

        builder.HasIndex(x => x.PrescripcionId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
