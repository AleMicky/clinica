using Clinica.Modules.Compras.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Compras.Infrastructure.Persistence.Configurations;

public sealed class ProveedorConfiguration : BaseEntityConfiguration<Proveedor>
{
    public override void Configure(EntityTypeBuilder<Proveedor> builder)
    {
        base.Configure(builder);
        builder.ToTable("Proveedores");
        builder.Property(x => x.Codigo).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Codigo).IsUnique();
        builder.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Nit).HasMaxLength(50);
        builder.Property(x => x.Telefono).HasMaxLength(50);
        builder.Property(x => x.Email).HasMaxLength(200);
        builder.Property(x => x.Activo).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
