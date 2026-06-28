using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class FormularioClinicoConfiguration : BaseEntityConfiguration<FormularioClinico>
{
    public override void Configure(EntityTypeBuilder<FormularioClinico> builder)
    {
        base.Configure(builder);

        builder.ToTable("FormulariosClinicos");

        builder.Property(x => x.TipoAtencionId)
            .IsRequired();

        builder.HasOne(x => x.TipoAtencion)
            .WithMany(x => x.FormulariosClinicos)
            .HasForeignKey(x => x.TipoAtencionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(500);

        builder.HasIndex(x => new { x.TipoAtencionId, x.Codigo, x.Version })
            .IsUnique();

        builder.Property(x => x.Activo)
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
