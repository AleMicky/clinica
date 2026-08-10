using Clinica.Api.Modules.Seguridad.Roles.Dtos;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Roles.Mappers;

[Mapper]
public static partial class RolMapper
{
    [MapperIgnoreSource(nameof(Rol.NormalizedName))]
    [MapperIgnoreSource(nameof(Rol.ConcurrencyStamp))]
    public static partial RolResponse ToResponse(Rol rol);

    public static partial List<RolResponse> ToResponse(List<Rol> roles);

    [MapperIgnoreTarget(nameof(Rol.Id))]
    [MapperIgnoreTarget(nameof(Rol.NormalizedName))]
    [MapperIgnoreTarget(nameof(Rol.ConcurrencyStamp))]
    public static partial Rol ToEntity(CreateRolRequest request);

    [MapperIgnoreTarget(nameof(Rol.Id))]
    [MapperIgnoreTarget(nameof(Rol.NormalizedName))]
    [MapperIgnoreTarget(nameof(Rol.ConcurrencyStamp))]
    public static partial void UpdateEntity(
        UpdateRolRequest request,
        Rol rol);
}