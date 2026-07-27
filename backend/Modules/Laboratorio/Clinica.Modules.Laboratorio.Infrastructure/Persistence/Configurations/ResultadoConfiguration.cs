using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class ResultadoConfiguration : BaseEntityConfiguration<Resultado>
{
    public override void Configure(EntityTypeBuilder<Resultado> builder)
    {
        base.Configure(builder);

        builder.ToTable("Resultados");

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Observaciones)
            .HasMaxLength(1000);

        builder.HasOne(x => x.Solicitud)
            .WithMany(x => x.Resultados)
            .HasForeignKey(x => x.SolicitudId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Muestra)
            .WithMany()
            .HasForeignKey(x => x.MuestraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SolicitudId);
        builder.HasIndex(x => x.MuestraId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
