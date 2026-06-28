using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class SignoVitalConfiguration : BaseEntityConfiguration<SignoVital>
{
    public override void Configure(EntityTypeBuilder<SignoVital> builder)
    {
        base.Configure(builder);

        builder.ToTable("SignosVitales");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.SignosVitales)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Temperatura).HasPrecision(5, 2);
        builder.Property(x => x.SaturacionOxigeno).HasPrecision(5, 2);
        builder.Property(x => x.GlucemiaCapilar).HasPrecision(6, 2);
        builder.Property(x => x.Peso).HasPrecision(6, 2);
        builder.Property(x => x.Talla).HasPrecision(5, 2);
        builder.Property(x => x.Imc).HasPrecision(5, 2);

        builder.HasIndex(x => x.AtencionId);
        builder.HasIndex(x => x.FechaRegistro);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
