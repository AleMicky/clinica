using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Enums;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class ProgramacionConfiguration : BaseEntityConfiguration<Programacion>
{
    public override void Configure(EntityTypeBuilder<Programacion> builder)
    {
        base.Configure(builder);

        builder.ToTable("Programacion");

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.FechaFin)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired()
            .HasDefaultValue(EstadoProgramacion.Borrador);

        builder.Property(x => x.Observacion)
            .HasMaxLength(1000);

        builder.HasOne(x => x.GrupoProgramacion)
            .WithMany(x => x.Programaciones)
            .HasForeignKey(x => x.GrupoProgramacionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.GrupoProgramacionId);
        builder.HasIndex(x => new { x.FechaInicio, x.FechaFin });

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
