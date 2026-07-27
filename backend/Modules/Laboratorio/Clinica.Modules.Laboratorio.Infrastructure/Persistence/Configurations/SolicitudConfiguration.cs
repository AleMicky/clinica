using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence.Configurations;

public sealed class SolicitudConfiguration : BaseEntityConfiguration<Solicitud>
{
    public override void Configure(EntityTypeBuilder<Solicitud> builder)
    {
        base.Configure(builder);

        builder.ToTable("Solicitudes");

        builder.Property(x => x.Numero)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.Property(x => x.Origen)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Estado)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(x => x.MedicoExternoNombre)
            .HasMaxLength(200);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(1000);

        builder.HasIndex(x => x.PacienteId);
        builder.HasIndex(x => x.AtencionId);
        builder.HasIndex(x => x.Estado);
        builder.HasIndex(x => x.FechaSolicitud);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
