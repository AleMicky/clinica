using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class AreaConfiguration : BaseEntityConfiguration<Area>
{
    public override void Configure(EntityTypeBuilder<Area> builder)
    {
        base.Configure(builder);

        builder.ToTable("Areas");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(500);

        builder.HasOne(x => x.TipoArea)
            .WithMany()
            .HasForeignKey(x => x.TipoAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AreaPadre)
            .WithMany(x => x.SubAreas)
            .HasForeignKey(x => x.AreaPadreId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ResponsableEmpleado)
            .WithMany()
            .HasForeignKey(x => x.ResponsableEmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.TipoAreaId);
        builder.HasIndex(x => x.AreaPadreId);
        builder.HasIndex(x => x.ResponsableEmpleadoId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
