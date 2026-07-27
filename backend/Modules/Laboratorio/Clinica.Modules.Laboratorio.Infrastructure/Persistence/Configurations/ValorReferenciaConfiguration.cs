using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class ValorReferenciaConfiguration : BaseEntityConfiguration<ValorReferencia>
{
    public override void Configure(EntityTypeBuilder<ValorReferencia> builder)
    {
        base.Configure(builder);

        builder.ToTable("ValoresReferencia");

        builder.Property(x => x.Sexo)
            .HasMaxLength(20);

        builder.Property(x => x.ValorMin)
            .HasPrecision(18, 4);

        builder.Property(x => x.ValorMax)
            .HasPrecision(18, 4);

        builder.Property(x => x.ValorTexto)
            .HasMaxLength(200);

        builder.HasOne(x => x.Parametro)
            .WithMany(x => x.ValoresReferencia)
            .HasForeignKey(x => x.ParametroId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ParametroId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
