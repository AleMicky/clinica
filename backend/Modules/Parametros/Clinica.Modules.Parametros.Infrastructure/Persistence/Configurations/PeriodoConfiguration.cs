using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence.Configurations;

public sealed class PeriodoConfiguration : BaseEntityConfiguration<Periodo>
{
    public override void Configure(EntityTypeBuilder<Periodo> builder)
    {
        base.Configure(builder);

        builder.ToTable("Periodos");

        builder.Property(x => x.GestionId)
            .IsRequired();

        builder.HasOne(x => x.Gestion)
            .WithMany(x => x.Periodos)
            .HasForeignKey(x => x.GestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Numero)
            .IsRequired();

        builder.HasIndex(x => new { x.GestionId, x.Numero })
            .IsUnique();

        builder.Property(x => x.FechaInicio)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.FechaFin)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.Literal)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
