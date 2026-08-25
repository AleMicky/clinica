using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Mappers;

[Mapper]
public static partial class RolOpcionMenuMapper
{
    [MapProperty(
        "OpcionMenu.PadreId",
        nameof(RolOpcionMenuResponse.PadreId))]
    [MapProperty(
        "OpcionMenu.Codigo",
        nameof(RolOpcionMenuResponse.Codigo))]
    [MapProperty(
        "OpcionMenu.Nombre",
        nameof(RolOpcionMenuResponse.Nombre))]
    [MapProperty(
        "OpcionMenu.Ruta",
        nameof(RolOpcionMenuResponse.Ruta))]
    [MapProperty(
        "OpcionMenu.Icono",
        nameof(RolOpcionMenuResponse.Icono))]
    [MapProperty(
        "OpcionMenu.Orden",
        nameof(RolOpcionMenuResponse.Orden))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.Rol))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.Id))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.Activo))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.FechaCreacion))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.FechaModificacion))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.CreadoPor))]
    [MapperIgnoreSource(nameof(RolOpcionMenu.ModificadoPor))]
    public static partial RolOpcionMenuResponse ToResponse(
        RolOpcionMenu entity
    );

    public static partial List<RolOpcionMenuResponse> ToResponse(
        IEnumerable<RolOpcionMenu> entities
    );
}