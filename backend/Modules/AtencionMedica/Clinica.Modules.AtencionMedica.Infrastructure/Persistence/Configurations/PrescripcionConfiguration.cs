using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class PrescripcionConfiguration : BaseEntityConfiguration<Prescripcion>
{
    public override void Configure(EntityTypeBuilder<Prescripcion> builder)
    {
        base.Configure(builder);

        builder.ToTable("Prescripciones");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.Prescripciones)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(2000);

        builder.HasIndex(x => x.AtencionId);
        builder.HasIndex(x => x.Fecha);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
