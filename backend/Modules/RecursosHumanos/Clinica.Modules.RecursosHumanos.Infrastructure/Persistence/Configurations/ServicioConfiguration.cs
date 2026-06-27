using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class ServicioConfiguration : BaseEntityConfiguration<Servicio>
{
    public override void Configure(EntityTypeBuilder<Servicio> builder)
    {
        base.Configure(builder);

        builder.ToTable("Servicios");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => new { x.DepartamentoId, x.Codigo })
            .IsUnique();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Descripcion)
            .HasMaxLength(500);

        builder.HasOne(x => x.Departamento)
            .WithMany(x => x.Servicios)
            .HasForeignKey(x => x.DepartamentoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.DepartamentoId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
