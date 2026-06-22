namespace Clinica.Modules.Seguridad.Application.Abstractions;

public interface IAuthService
{
    Task<Auth.LoginResponse> LoginAsync(Auth.LoginRequest request, CancellationToken cancellationToken = default);
}
