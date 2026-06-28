using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class DiagnosticoConfiguration : BaseEntityConfiguration<Diagnostico>
{
    public override void Configure(EntityTypeBuilder<Diagnostico> builder)
    {
        base.Configure(builder);

        builder.ToTable("Diagnosticos");

        builder.Property(x => x.CodigoCie10)
            .HasMaxLength(10)
            .IsRequired();

        builder.HasIndex(x => x.CodigoCie10)
            .IsUnique();

        builder.Property(x => x.Nombre)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(2000);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
