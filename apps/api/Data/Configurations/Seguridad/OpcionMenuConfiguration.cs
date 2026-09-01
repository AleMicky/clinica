using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Seguridad;

public sealed class OpcionMenuConfiguration
    : AuditableEntityConfiguration<OpcionMenu>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<OpcionMenu> builder)
    {
        builder.ToTable("OpcionesMenu");

        builder.Property(x => x.Codigo)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Ruta)
            .HasMaxLength(250);

        builder.Property(x => x.Icono)
            .HasMaxLength(100);

        builder.Property(x => x.Orden)
            .IsRequired();

        builder.Property(x => x.Activo)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasIndex(x => x.PadreId);

        builder.HasIndex(x => new
        {
            x.PadreId,
            x.Orden
        });

        builder.HasOne(x => x.Padre)
            .WithMany(x => x.Hijos)
            .HasForeignKey(x => x.PadreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}