using Clinica.Modules.Seguridad.Application.Users;

namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IUsuarioPersonaService
{
    Task<UsuarioPersonaResponse> CreateAsync(
        CreateUsuarioPersonaRequest request,
        CancellationToken cancellationToken = default);
}
