using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class FormularioSeccionConfiguration : BaseEntityConfiguration<FormularioSeccion>
{
    public override void Configure(EntityTypeBuilder<FormularioSeccion> builder)
    {
        base.Configure(builder);

        builder.ToTable("FormularioSecciones");

        builder.Property(x => x.FormularioClinicoId)
            .IsRequired();

        builder.HasOne(x => x.FormularioClinico)
            .WithMany(x => x.Secciones)
            .HasForeignKey(x => x.FormularioClinicoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.EtapaFlujo)
            .HasMaxLength(50);

        builder.Property(x => x.Visible)
            .HasDefaultValue(true);

        builder.HasIndex(x => new { x.FormularioClinicoId, x.Codigo })
            .IsUnique();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
