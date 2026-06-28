using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class EstudioConfiguration : BaseEntityConfiguration<Estudio>
{
    public override void Configure(EntityTypeBuilder<Estudio> builder)
    {
        base.Configure(builder);

        builder.ToTable("Estudios");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.Estudios)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.TipoEstudioId)
            .IsRequired();

        builder.HasOne(x => x.TipoEstudio)
            .WithMany()
            .HasForeignKey(x => x.TipoEstudioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Nombre)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(x => x.Justificacion)
            .HasMaxLength(2000);

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.AtencionId);
        builder.HasIndex(x => x.Estado);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
