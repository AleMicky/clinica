using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface ICorrelativoService
{
    Task<PagedResult<CorrelativoResponse>> GetPagedAsync(
        CorrelativoPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<CorrelativoResponse> GenerarAsync(
        GenerarCorrelativoRequest request,
        CancellationToken cancellationToken = default);
}
