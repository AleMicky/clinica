using Clinica.Modules.Compras.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Compras.Infrastructure.Persistence.Configurations;

public sealed class OrdenCompraConfiguration : BaseEntityConfiguration<OrdenCompra>
{
    public override void Configure(EntityTypeBuilder<OrdenCompra> builder)
    {
        base.Configure(builder);
        builder.ToTable("OrdenesCompra");
        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.Property(x => x.Estado).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Observaciones).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
        builder.HasOne(x => x.Proveedor).WithMany(x => x.Ordenes).HasForeignKey(x => x.ProveedorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.Detalles).WithOne(x => x.OrdenCompra).HasForeignKey(x => x.OrdenCompraId).OnDelete(DeleteBehavior.Cascade);
    }
}
