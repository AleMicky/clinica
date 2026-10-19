using Clinica.Api.Modules.Quirofano.Cirugia.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Configurations;

public class CirugiaConfiguration : IEntityTypeConfiguration<Entity.Cirugia>
{
    public void Configure(EntityTypeBuilder<Entity.Cirugia> builder)
    {
        builder.ToTable("Quirofano_Cirugias");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Numero)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.Property(x => x.SalaOperaciones)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ProcedimientoQuirurgico)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.DiagnosticoPreOperatorio)
            .HasMaxLength(300);

        builder.Property(x => x.DiagnosticoPostOperatorio)
            .HasMaxLength(300);

        builder.Property(x => x.Instrumentista)
            .HasMaxLength(150);

        builder.Property(x => x.Circulante)
            .HasMaxLength(150);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(500);

        builder.Property(x => x.MotivoCancelacion)
            .HasMaxLength(300);

        builder.HasOne(x => x.Admision)
            .WithMany()
            .HasForeignKey(x => x.AdmisionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Paciente)
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CirujanoPrincipal)
            .WithMany()
            .HasForeignKey(x => x.CirujanoPrincipalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Anestesiologo)
            .WithMany()
            .HasForeignKey(x => x.AnestesiologoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PrimerAyudante)
            .WithMany()
            .HasForeignKey(x => x.PrimerAyudanteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Almacen)
            .WithMany()
            .HasForeignKey(x => x.AlmacenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MovimientoInventario)
            .WithMany()
            .HasForeignKey(x => x.MovimientoInventarioId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.GastosMateriales)
            .WithOne(d => d.Cirugia)
            .HasForeignKey(d => d.CirugiaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CirugiaGastoMaterialConfiguration : IEntityTypeConfiguration<CirugiaGastoMaterial>
{
    public void Configure(EntityTypeBuilder<CirugiaGastoMaterial> builder)
    {
        builder.ToTable("Quirofano_CirugiasGastosMateriales");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Cantidad)
            .HasPrecision(18, 2);

        builder.Property(x => x.CostoUnitario)
            .HasPrecision(18, 2);

        builder.Property(x => x.PrecioUnitario)
            .HasPrecision(18, 2);

        builder.Property(x => x.MomentoQuirurgico)
            .HasMaxLength(100);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(300);

        builder.HasOne(x => x.Producto)
            .WithMany()
            .HasForeignKey(x => x.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PartidaInventario)
            .WithMany()
            .HasForeignKey(x => x.PartidaInventarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
