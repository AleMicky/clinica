using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class NumeracionAtencionConfiguration : BaseEntityConfiguration<NumeracionAtencion>
{
    public override void Configure(EntityTypeBuilder<NumeracionAtencion> builder)
    {
        base.Configure(builder);

        builder.ToTable("NumeracionesAtencion");

        builder.Property(x => x.TipoAtencionId)
            .IsRequired();

        builder.Property(x => x.Gestion)
            .IsRequired();

        builder.Property(x => x.UltimoCorrelativo)
            .IsRequired();

        builder.HasOne(x => x.TipoAtencion)
            .WithMany()
            .HasForeignKey(x => x.TipoAtencionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TipoAtencionId, x.Gestion })
            .IsUnique();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
