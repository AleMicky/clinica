using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class TratamientoConfiguration : BaseEntityConfiguration<Tratamiento>
{
    public override void Configure(EntityTypeBuilder<Tratamiento> builder)
    {
        base.Configure(builder);

        builder.ToTable("Tratamientos");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.Tratamientos)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Descripcion)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.Indicaciones)
            .HasMaxLength(2000);

        builder.HasIndex(x => x.AtencionId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
