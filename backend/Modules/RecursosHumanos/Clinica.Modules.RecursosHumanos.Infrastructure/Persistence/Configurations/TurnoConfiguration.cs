using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Persistence.Configurations;

public sealed class TurnoConfiguration : BaseEntityConfiguration<Turno>
{
    public override void Configure(EntityTypeBuilder<Turno> builder)
    {
        base.Configure(builder);

        builder.ToTable("Turnos");

        builder.Property(x => x.Codigo).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Codigo).IsUnique();

        builder.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
        builder.Property(x => x.HoraInicio).IsRequired();
        builder.Property(x => x.HoraFin).IsRequired();
        builder.Property(x => x.CruceDia).HasDefaultValue(false);
        builder.Property(x => x.Activo).HasDefaultValue(true);
        builder.Property(x => x.PermiteMultiplesMedicosTurno).HasDefaultValue(false);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => x.Activo);
    }
}
