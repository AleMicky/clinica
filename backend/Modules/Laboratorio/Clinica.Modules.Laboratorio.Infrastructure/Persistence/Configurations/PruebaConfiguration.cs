using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class PruebaConfiguration : BaseEntityConfiguration<Prueba>
{
    public override void Configure(EntityTypeBuilder<Prueba> builder)
    {
        base.Configure(builder);

        builder.ToTable("Pruebas");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasOne(x => x.Especialidad)
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TipoExamen)
            .WithMany()
            .HasForeignKey(x => x.TipoExamenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TipoMuestra)
            .WithMany()
            .HasForeignKey(x => x.TipoMuestraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.EspecialidadId);
        builder.HasIndex(x => x.TipoExamenId);
        builder.HasIndex(x => x.TipoMuestraId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
