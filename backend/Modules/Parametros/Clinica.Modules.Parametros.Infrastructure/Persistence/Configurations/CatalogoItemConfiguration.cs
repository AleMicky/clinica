using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence.Configurations;

public sealed class CatalogoItemConfiguration
    : BaseEntityConfiguration<CatalogoItem>
{
    public override void Configure(
        EntityTypeBuilder<CatalogoItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("CatalogoItems");

        builder.Property(x => x.CatalogoGrupoId)
            .IsRequired();

        builder.HasOne(x => x.CatalogoGrupo)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.CatalogoGrupoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => new { x.CatalogoGrupoId, x.Codigo })
            .IsUnique();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Valor)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
