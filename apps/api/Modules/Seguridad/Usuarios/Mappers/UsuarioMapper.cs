using Clinica.Api.Modules.Seguridad.Usuarios.Dtos;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Usuarios.Mappers;

[Mapper]
public static partial class UsuarioMapper
{
    public static partial UsuarioResponse ToResponse(Usuario usuario);
}