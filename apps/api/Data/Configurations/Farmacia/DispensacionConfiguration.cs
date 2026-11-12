using Clinica.Api.Modules.Farmacia.Dispensacion.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Farmacia;

public class DispensacionConfiguration : IEntityTypeConfiguration<Dispensacion>
{
    public void Configure(EntityTypeBuilder<Dispensacion> builder)
    {
        builder.ToTable("Farmacia_Dispensaciones");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Numero)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.Property(x => x.ClienteNombre)
            .HasMaxLength(200);

        builder.Property(x => x.ClienteDocumento)
            .HasMaxLength(50);

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(x => x.Descuento)
            .HasPrecision(18, 2);

        builder.Property(x => x.Total)
            .HasPrecision(18, 2);

        builder.Property(x => x.MetodoPago)
            .HasMaxLength(50);

        builder.Property(x => x.ComprobanteCobro)
            .HasMaxLength(100);

        builder.Property(x => x.UsuarioCobro)
            .HasMaxLength(100);

        builder.Property(x => x.UsuarioEntrega)
            .HasMaxLength(100);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(1000);

        builder.Property(x => x.MotivoAnulacion)
            .HasMaxLength(500);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Paciente)
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Medico)
            .WithMany()
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Admision)
            .WithMany()
            .HasForeignKey(x => x.AdmisionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(d => d.Dispensacion)
            .HasForeignKey(d => d.DispensacionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

