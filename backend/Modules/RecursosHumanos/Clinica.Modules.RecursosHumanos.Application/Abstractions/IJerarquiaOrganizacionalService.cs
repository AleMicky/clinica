using Clinica.Modules.RecursosHumanos.Application.Jerarquia;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface IJerarquiaOrganizacionalService
{
    Task<JerarquiaOrganizacionalResponse> GetAsync(
        JerarquiaOrganizacionalRequest request,
        CancellationToken cancellationToken = default);
}
