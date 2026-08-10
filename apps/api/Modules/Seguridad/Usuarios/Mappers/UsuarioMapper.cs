using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

[Mapper]
public static partial class UsuarioMapper
{
    public static partial UsuarioResponse ToResponse(Usuario usuario);
}