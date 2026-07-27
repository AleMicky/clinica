using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class ParametroConfiguration : BaseEntityConfiguration<Parametro>
{
    public override void Configure(EntityTypeBuilder<Parametro> builder)
    {
        base.Configure(builder);

        builder.ToTable("Parametros");

        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.TipoDato)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => new { x.PruebaId, x.Codigo })
            .IsUnique();

        builder.HasOne(x => x.Prueba)
            .WithMany(x => x.Parametros)
            .HasForeignKey(x => x.PruebaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.PruebaId);
        builder.HasIndex(x => x.UnidadMedidaId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
