using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence.Configurations;

public sealed class UnidadesMedidaConfiguration
    : BaseEntityConfiguration<UnidadesMedida>
{
    public override void Configure(
        EntityTypeBuilder<UnidadesMedida> builder)
    {
        base.Configure(builder);

        builder.ToTable("UnidadesMedida");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Simbolo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
