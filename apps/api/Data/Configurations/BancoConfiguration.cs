using Clinica.Api.Modules.Parametros.Banco.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class BancoConfiguration
    : AuditableEntityConfiguration<Banco>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<Banco> builder)
    {
        builder.ToTable("Bancos");

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.NombreCorto)
            .HasMaxLength(50);

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}
