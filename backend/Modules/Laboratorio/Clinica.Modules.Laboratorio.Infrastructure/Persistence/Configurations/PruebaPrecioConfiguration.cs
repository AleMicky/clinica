using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class PruebaPrecioConfiguration : BaseEntityConfiguration<PruebaPrecio>
{
    public override void Configure(EntityTypeBuilder<PruebaPrecio> builder)
    {
        base.Configure(builder);

        builder.ToTable("PruebaPrecios");

        builder.Property(x => x.ImporteFacturado)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CostoLaboratorio)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CostoDerivacion)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.FechaInicio)
            .IsRequired();

        builder.Property(x => x.MotivoCambio)
            .HasMaxLength(300)
            .IsRequired();

        builder.HasOne(x => x.Prueba)
            .WithMany()
            .HasForeignKey(x => x.PruebaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.PruebaId);
        builder.HasIndex(x => new { x.PruebaId, x.FechaInicio });

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
