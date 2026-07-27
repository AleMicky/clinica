using Clinica.Modules.Laboratorio.Application.Muestras;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IMuestraService
{
    Task<PagedResult<MuestraResponse>> GetPagedAsync(
        MuestraPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<MuestraResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<MuestraResponse> TomarMuestraAsync(
        Guid solicitudId,
        TomarMuestraRequest request,
        CancellationToken cancellationToken = default);
}
