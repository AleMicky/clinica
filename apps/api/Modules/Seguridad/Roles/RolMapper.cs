using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Roles;

[Mapper]
public static partial class RolMapper
{
    public static partial RolResponse ToResponse(Rol rol);

    public static partial List<RolResponse> ToResponse(List<Rol> roles);
}