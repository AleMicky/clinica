using Clinica.Api.Modules.RecursosHumanos.Area.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class AreaConfiguration
    : AuditableEntityConfiguration<Area>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Area> builder)
    {
        builder.ToTable("Areas");

        builder.Property(x => x.Codigo)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.Property(x => x.TipoAreaId)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.TipoAreaId,
            x.Codigo
        }).IsUnique();

        builder.HasOne(x => x.TipoArea)
            .WithMany(x => x.Areas)
            .HasForeignKey(x => x.TipoAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AreaPadre)
            .WithMany(x => x.Subareas)
            .HasForeignKey(x => x.AreaPadreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}