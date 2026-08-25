using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;

public class RolOpcionMenu : AuditableEntity
{
    public int RolId { get; set; }
    public Rol Rol { get; set; } = null!;

    public int OpcionMenuId { get; set; }
    public OpcionMenu OpcionMenu { get; set; } = null!;
}