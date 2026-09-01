using Clinica.Api.Modules.Parametros.Catalogo;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Parametros;

public sealed class CatalogoGrupoConfiguration : AuditableEntityConfiguration<CatalogoGrupo>
{
    protected override void ConfigureEntity(EntityTypeBuilder<CatalogoGrupo> builder)
    {
        builder.ToTable("CatalogoGrupo");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
        
        builder.HasMany(x => x.Items)
            .WithOne(x => x.CatalogoGrupo)
            .HasForeignKey(x => x.CatalogoGrupoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}