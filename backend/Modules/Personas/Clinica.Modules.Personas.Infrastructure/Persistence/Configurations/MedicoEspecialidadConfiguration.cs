using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Personas.Infrastructure.Persistence.Configurations;

public sealed class MedicoEspecialidadConfiguration : BaseEntityConfiguration<MedicoEspecialidad>
{
    public override void Configure(EntityTypeBuilder<MedicoEspecialidad> builder)
    {
        base.Configure(builder);

        builder.ToTable("MedicoEspecialidades");

        builder.HasIndex(x => new { x.MedicoId, x.EspecialidadId })
            .IsUnique();

        builder.HasIndex(x => x.MedicoId)
            .HasFilter("[EsPrincipal] = 1")
            .IsUnique();

        builder.HasOne(x => x.Medico)
            .WithMany(x => x.Especialidades)
            .HasForeignKey(x => x.MedicoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Especialidad)
            .WithMany()
            .HasForeignKey(x => x.EspecialidadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
