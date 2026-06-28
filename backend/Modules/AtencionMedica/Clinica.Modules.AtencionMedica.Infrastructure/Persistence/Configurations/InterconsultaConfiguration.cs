using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Persistence.Configurations;

public sealed class InterconsultaConfiguration : BaseEntityConfiguration<Interconsulta>
{
    public override void Configure(EntityTypeBuilder<Interconsulta> builder)
    {
        base.Configure(builder);

        builder.ToTable("Interconsultas");

        builder.Property(x => x.AtencionId)
            .IsRequired();

        builder.HasOne(x => x.Atencion)
            .WithMany(x => x.Interconsultas)
            .HasForeignKey(x => x.AtencionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.EspecialidadId)
            .IsRequired();

        builder.HasOne<Especialidad>()
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Medico>()
            .WithMany()
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.Motivo)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.Respuesta)
            .HasMaxLength(4000);

        builder.HasIndex(x => x.AtencionId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
