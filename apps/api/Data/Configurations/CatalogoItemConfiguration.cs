using Clinica.Api.Modules.Parametros.Catalogo;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class CatalogoItemConfiguration : AuditableEntityConfiguration<CatalogoItem>
{
    protected override void ConfigureEntity(EntityTypeBuilder<CatalogoItem> builder)
    {
        builder.ToTable("CatalogosItems");

        builder.Property(x => x.Valor)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Orden)
            .HasDefaultValue(0);

        builder.HasIndex(x => new
        {
            x.CatalogoGrupoId,
            x.Valor
        }).IsUnique();

        builder.HasOne(x => x.CatalogoGrupo)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.CatalogoGrupoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}