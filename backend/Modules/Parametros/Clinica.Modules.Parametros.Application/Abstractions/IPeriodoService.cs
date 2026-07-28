using Clinica.Modules.Parametros.Application.Periodos;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface IPeriodoService
{
    Task<PagedResult<PeriodoResponse>> GetPagedAsync(
        PeriodoPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<PeriodoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<PeriodoResponse> UpdateAsync(
        Guid id,
        UpdatePeriodoRequest request,
        CancellationToken cancellationToken = default);
}
