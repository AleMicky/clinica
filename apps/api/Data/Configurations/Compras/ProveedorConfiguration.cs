using Clinica.Api.Modules.Compras.Proveedor.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Compras;

public sealed class ProveedorConfiguration
    : AuditableEntityConfiguration<Proveedor>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Proveedor> builder)
    {
        builder.ToTable("Proveedores");

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.RazonSocial)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.NombreComercial)
            .HasMaxLength(150);

        builder.Property(x => x.Nit)
            .HasMaxLength(20);

        builder.Property(x => x.Direccion)
            .HasMaxLength(250);

        builder.Property(x => x.Telefono)
            .HasMaxLength(20);

        builder.Property(x => x.Celular)
            .HasMaxLength(20);

        builder.Property(x => x.Email)
            .HasMaxLength(150);

        builder.Property(x => x.Contacto)
            .HasMaxLength(100);

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasIndex(x => x.Nit)
            .IsUnique()
            .HasFilter("[Nit] IS NOT NULL");
    }
}
