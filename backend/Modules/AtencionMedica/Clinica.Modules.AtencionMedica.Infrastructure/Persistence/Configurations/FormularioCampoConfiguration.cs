using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class FormularioCampoConfiguration : BaseEntityConfiguration<FormularioCampo>
{
    public override void Configure(EntityTypeBuilder<FormularioCampo> builder)
    {
        base.Configure(builder);

        builder.ToTable("FormularioCampos");

        builder.Property(x => x.FormularioSeccionId)
            .IsRequired();

        builder.HasOne(x => x.FormularioSeccion)
            .WithMany(x => x.Campos)
            .HasForeignKey(x => x.FormularioSeccionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Etiqueta)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.TipoCampoFormularioId)
            .IsRequired();

        builder.HasOne(x => x.TipoCampoFormulario)
            .WithMany(x => x.Campos)
            .HasForeignKey(x => x.TipoCampoFormularioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.FormularioSeccionId, x.Codigo })
            .IsUnique();

        builder.Property(x => x.Visible)
            .HasDefaultValue(true);

        builder.Property(x => x.Placeholder)
            .HasMaxLength(200);

        builder.Property(x => x.ValorDefecto)
            .HasMaxLength(500);

        builder.Property(x => x.OpcionesJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.ValidacionesJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
