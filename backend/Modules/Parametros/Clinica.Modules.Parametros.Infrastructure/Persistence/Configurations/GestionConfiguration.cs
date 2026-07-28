using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence.Configurations;

public sealed class GestionConfiguration : BaseEntityConfiguration<Gestion>
{
    public override void Configure(EntityTypeBuilder<Gestion> builder)
    {
        base.Configure(builder);

        builder.ToTable("Gestiones");

        builder.Property(x => x.NumeroGestion)
            .HasColumnName("Gestion")
            .IsRequired();

        builder.HasIndex(x => x.NumeroGestion)
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

        builder.Property(x => x.Activa)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
