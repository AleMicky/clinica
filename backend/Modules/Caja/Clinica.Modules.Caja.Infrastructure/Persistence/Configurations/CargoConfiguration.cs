using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class CargoConfiguration : BaseEntityConfiguration<Cargo>
{
    public override void Configure(EntityTypeBuilder<Cargo> builder)
    {
        base.Configure(builder);

        builder.ToTable("Cargos");

        builder.Property(x => x.Concepto)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(x => x.Codigo)
            .HasMaxLength(50);

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 4);

        builder.Property(x => x.MontoUnitario)
            .HasPrecision(18, 2);

        builder.Property(x => x.MontoTotal)
            .HasPrecision(18, 2);

        builder.Property(x => x.ModuloOrigen)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.EntidadOrigen)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(x => new
            {
                x.ModuloOrigen,
                x.EntidadOrigen,
                x.ReferenciaId,
                x.ReferenciaLineaId
            })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
