using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class AtencionConfiguration : BaseEntityConfiguration<Atencion>
{
    public override void Configure(EntityTypeBuilder<Atencion> builder)
    {
        base.Configure(builder);

        builder.ToTable("Atenciones");

        builder.Property(x => x.NumeroAtencion)
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.NumeroAtencion)
            .IsUnique();

        builder.Property(x => x.PacienteId)
            .IsRequired();

        builder.HasOne<Paciente>()
            .WithMany()
            .HasForeignKey(x => x.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.TipoAtencionId)
            .IsRequired();

        builder.HasOne(x => x.TipoAtencion)
            .WithMany(x => x.Atenciones)
            .HasForeignKey(x => x.TipoAtencionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.ServicioId);

        builder.HasOne<Servicio>()
            .WithMany()
            .HasForeignKey(x => x.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.EspecialidadId);

        builder.HasOne<Especialidad>()
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.MedicoId);

        builder.HasOne<Medico>()
            .WithMany()
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.MotivoConsulta)
            .HasMaxLength(500);

        builder.Property(x => x.FormularioClinicoId);

        builder.HasOne(x => x.FormularioClinico)
            .WithMany(x => x.Atenciones)
            .HasForeignKey(x => x.FormularioClinicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Estado)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Observaciones)
            .HasMaxLength(2000);

        builder.Property(x => x.ResponsableFinancieroNombre)
            .HasMaxLength(200);

        builder.Property(x => x.ResponsableFinancieroDocumento)
            .HasMaxLength(50);

        builder.Property(x => x.ResponsableFinancieroTelefono)
            .HasMaxLength(30);

        builder.Property(x => x.SeguroNombre)
            .HasMaxLength(200);

        builder.Property(x => x.NumeroAfiliacion)
            .HasMaxLength(50);

        builder.HasIndex(x => x.PacienteId);
        builder.HasIndex(x => x.FechaAtencion);
        builder.HasIndex(x => x.FechaRecepcion);
        builder.HasIndex(x => x.Estado);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
