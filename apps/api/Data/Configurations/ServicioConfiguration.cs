using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class ServicioConfiguration
    : AuditableEntityConfiguration<Servicio>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Servicio> builder)
    {
        builder.ToTable("Servicios");

        builder.Property(x => x.Codigo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.HasOne(x => x.CategoriaServicio)
            .WithMany(x => x.Servicios)
            .HasForeignKey(x => x.CategoriaServicioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}