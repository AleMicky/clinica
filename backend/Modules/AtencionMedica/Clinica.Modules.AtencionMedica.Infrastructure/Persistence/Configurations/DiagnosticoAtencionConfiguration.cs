using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class DiagnosticoAtencionConfiguration : BaseEntityConfiguration<DiagnosticoAtencion>
{
    public override void Configure(EntityTypeBuilder<DiagnosticoAtencion> builder)
    {
        base.Configure(builder);

        builder.ToTable("DiagnosticoAtenciones");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.Diagnosticos)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.DiagnosticoId)
            .IsRequired();

        builder.HasOne(x => x.Diagnostico)
            .WithMany(x => x.Atenciones)
            .HasForeignKey(x => x.DiagnosticoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.AtencionId, x.DiagnosticoId })
            .IsUnique();

        builder.Property(x => x.Observaciones)
            .HasMaxLength(2000);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
