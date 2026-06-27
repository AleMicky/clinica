using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Personas.Infrastructure.Persistence.Configurations;

public sealed class ContactoEmergenciaConfiguration : BaseEntityConfiguration<ContactoEmergencia>
{
    public override void Configure(EntityTypeBuilder<ContactoEmergencia> builder)
    {
        base.Configure(builder);

        builder.ToTable("ContactosEmergencia");

        builder.Property(x => x.Nombres)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Apellidos)
            .HasMaxLength(100);

        builder.Property(x => x.Telefono)
            .HasMaxLength(20);

        builder.Property(x => x.Celular)
            .HasMaxLength(20);

        builder.Property(x => x.Direccion)
            .HasMaxLength(500);

        builder.HasOne(x => x.Parentesco)
            .WithMany()
            .HasForeignKey(x => x.ParentescoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.PersonaId);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
    }
}
