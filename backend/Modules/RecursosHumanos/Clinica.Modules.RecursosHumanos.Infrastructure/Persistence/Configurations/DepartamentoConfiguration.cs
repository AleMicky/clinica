using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class DepartamentoConfiguration : BaseEntityConfiguration<Departamento>
{
    public override void Configure(EntityTypeBuilder<Departamento> builder)
    {
        base.Configure(builder);

        builder.ToTable("Departamentos");

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

        builder.HasOne(x => x.Area)
            .WithMany(x => x.Departamentos)
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.AreaId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
