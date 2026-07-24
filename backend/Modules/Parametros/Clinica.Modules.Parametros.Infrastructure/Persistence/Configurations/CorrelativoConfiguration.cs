using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence.Configurations;

public sealed class CorrelativoConfiguration : IEntityTypeConfiguration<Correlativo>
{
    public void Configure(EntityTypeBuilder<Correlativo> builder)
    {
        builder.ToTable("Correlativos");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => new { x.Codigo, x.Gestion })
            .IsUnique();

        builder.Property(x => x.Gestion)
            .IsRequired();

        builder.Property(x => x.UltimoNumero)
            .IsRequired();

        builder.Property(x => x.Prefijo)
            .HasMaxLength(20);

        builder.Property(x => x.Longitud)
            .HasDefaultValue(6)
            .IsRequired();

        builder.Property(x => x.FechaCreacion)
            .HasDefaultValueSql("GETUTCDATE()")
            .IsRequired();
    }
}
