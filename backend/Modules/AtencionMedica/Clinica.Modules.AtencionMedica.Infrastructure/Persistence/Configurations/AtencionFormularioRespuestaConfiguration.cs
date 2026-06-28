using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class AtencionFormularioRespuestaConfiguration
    : BaseEntityConfiguration<AtencionFormularioRespuesta>
{
    public override void Configure(EntityTypeBuilder<AtencionFormularioRespuesta> builder)
    {
        base.Configure(builder);

        builder.ToTable("AtencionFormularioRespuestas");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.Respuestas)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.FormularioCampoId)
            .IsRequired();

        builder.HasOne(x => x.FormularioCampo)
            .WithMany()
            .HasForeignKey(x => x.FormularioCampoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.AtencionId, x.FormularioCampoId })
            .IsUnique();

        builder.Property(x => x.ValorTexto)
            .HasMaxLength(4000);

        builder.Property(x => x.ValorNumero)
            .HasPrecision(18, 4);

        builder.Property(x => x.ValorJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
