 using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
 using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class RolOpcionMenuConfiguration
    : IEntityTypeConfiguration<RolOpcionMenu>
{
    public void Configure(
        EntityTypeBuilder<RolOpcionMenu> builder)
    {
        builder.ToTable("RolesOpcionesMenu");

        builder.HasKey(x => new
        {
            x.RolId,
            x.OpcionMenuId
        });

        builder.HasOne(x => x.Rol)
            .WithMany(x => x.OpcionesMenu)
            .HasForeignKey(x => x.RolId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.OpcionMenu)
            .WithMany(x => x.Roles)
            .HasForeignKey(x => x.OpcionMenuId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}