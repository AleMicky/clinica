using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Almacen.Infrastructure.Persistence.Configurations;

public sealed class MedicamentoDetalleConfiguration : BaseEntityConfiguration<MedicamentoDetalle>
{
    public override void Configure(EntityTypeBuilder<MedicamentoDetalle> builder)
    {
        base.Configure(builder);
        builder.ToTable("MedicamentosDetalle");
        builder.HasIndex(x => x.ProductoId).IsUnique();
        builder.Property(x => x.NombreGenerico).HasMaxLength(200);
        builder.Property(x => x.NombreComercial).HasMaxLength(200);
        builder.Property(x => x.Concentracion).HasMaxLength(100);
        builder.Property(x => x.Presentacion).HasMaxLength(100);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasOne(x => x.FormaFarmaceutica)
            .WithMany(x => x.Medicamentos)
            .HasForeignKey(x => x.FormaFarmaceuticaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
