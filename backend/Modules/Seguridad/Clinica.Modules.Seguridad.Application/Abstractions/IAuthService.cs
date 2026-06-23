using Clinica.Modules.Seguridad.Application.Auth;

namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default
    );
}