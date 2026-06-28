using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class ResultadoEstudioConfiguration : BaseEntityConfiguration<ResultadoEstudio>
{
    public override void Configure(EntityTypeBuilder<ResultadoEstudio> builder)
    {
        base.Configure(builder);

        builder.ToTable("ResultadosEstudio");

        builder.Property(x => x.EstudioId)
            .IsRequired();

        builder.HasOne(x => x.Estudio)
            .WithOne(x => x.Resultado)
            .HasForeignKey<ResultadoEstudio>(x => x.EstudioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.EstudioId)
            .IsUnique();

        builder.Property(x => x.ResultadoTexto)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.ArchivoUrl)
            .HasMaxLength(500);

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
