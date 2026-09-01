using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Recepcion;

public sealed class AdmisionConfiguration
    : AuditableEntityConfiguration<Admision>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Admision> builder)
    {
        builder.ToTable("Admisiones");

        builder.Property(x => x.Numero)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.PacienteId)
            .IsRequired();

        builder.Property(x => x.RecepcionistaId)
            .IsRequired();

        builder.Property(x => x.FechaHora)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasIndex(x => x.Numero)
            .IsUnique();

        builder.HasIndex(x => x.PacienteId);

        builder.HasIndex(x => x.RecepcionistaId);

        builder.HasIndex(x => x.ConvenioId);

        builder.HasOne(x => x.Paciente)
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Recepcionista)
            .WithMany()
            .HasForeignKey(x => x.RecepcionistaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Convenio)
            .WithMany()
            .HasForeignKey(x => x.ConvenioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.Admision)
            .HasForeignKey(x => x.AdmisionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}