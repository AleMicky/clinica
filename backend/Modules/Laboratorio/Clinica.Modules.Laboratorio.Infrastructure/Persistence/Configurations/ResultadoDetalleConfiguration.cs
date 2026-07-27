using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class ResultadoDetalleConfiguration : BaseEntityConfiguration<ResultadoDetalle>
{
    public override void Configure(EntityTypeBuilder<ResultadoDetalle> builder)
    {
        base.Configure(builder);

        builder.ToTable("ResultadoDetalles");

        builder.Property(x => x.ValorNumerico)
            .HasPrecision(18, 4);

        builder.Property(x => x.ValorTexto)
            .HasMaxLength(500);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(500);

        builder.HasOne(x => x.Resultado)
            .WithMany(x => x.Detalles)
            .HasForeignKey(x => x.ResultadoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Parametro)
            .WithMany()
            .HasForeignKey(x => x.ParametroId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SolicitudDetalle)
            .WithMany()
            .HasForeignKey(x => x.SolicitudDetalleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.ResultadoId);
        builder.HasIndex(x => x.ParametroId);
        builder.HasIndex(x => x.SolicitudDetalleId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
