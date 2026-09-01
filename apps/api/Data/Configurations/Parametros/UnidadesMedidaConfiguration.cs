using Clinica.Api.Modules.Parametros.UnidadesMedida;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Parametros;

public sealed class UnidadesMedidaConfiguration
    : AuditableEntityConfiguration<UnidadesMedida>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<UnidadesMedida> builder)
    {
        builder.ToTable("UnidadesMedida");

        builder.Property(x => x.Categoria)
            .HasMaxLength(200)
            .IsRequired();
        
        builder.Property(x => x.Codigo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Nombre)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Simbolo)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => x.Codigo)
            .IsUnique();
    }
}