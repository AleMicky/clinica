using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public class RolConfiguration
    : IEntityTypeConfiguration<Rol>
{
    public void Configure(
        EntityTypeBuilder<Rol> builder)
    {
        builder.ToTable("Roles");

        builder.Property(x => x.Descripcion)
            .HasMaxLength(250);
    }
}