using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Farmacia.Infrastructure.Persistence.Configurations;

public sealed class RecetaConfiguration : BaseEntityConfiguration<Receta>
{
    public override void Configure(EntityTypeBuilder<Receta> builder)
    {
        base.Configure(builder);
        builder.ToTable("Recetas");
        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.Property(x => x.Estado).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Observaciones).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
        builder.HasMany(x => x.Detalles).WithOne(x => x.Receta).HasForeignKey(x => x.RecetaId).OnDelete(DeleteBehavior.Cascade);
    }
}
