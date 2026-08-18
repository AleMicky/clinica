using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class VentaConfiguration
    : AuditableEntityConfiguration<Venta>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Venta> builder)
    {
        builder.ToTable("Ventas");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Descuento)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Total)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired();

        builder.HasIndex(x => x.Numero)
            .IsUnique()
            .HasFilter("[Activo] = 1");

        builder.HasOne(x => x.Admision)
            .WithMany()
            .HasForeignKey(x => x.AdmisionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Paciente)
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);
        
          builder.HasOne(x => x.Vendedor)
            .WithMany()
            .HasForeignKey(x => x.VendedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Moneda)
            .WithMany()
            .HasForeignKey(x => x.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.Venta)
            .HasForeignKey(x => x.VentaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Pagadores)
            .WithOne(x => x.Venta)
            .HasForeignKey(x => x.VentaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
