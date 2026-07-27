using Clinica.Modules.Laboratorio.Application.Resultados;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IResultadoService
{
    Task<PagedResult<ResultadoResponse>> GetPagedAsync(
        ResultadoPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<ResultadoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<ResultadoResponse> RegistrarAsync(
        Guid solicitudId,
        RegistrarResultadosRequest request,
        CancellationToken cancellationToken = default);

    Task<ResultadoResponse> ValidarAsync(
        Guid resultadoId,
        ValidarResultadoRequest request,
        CancellationToken cancellationToken = default);
}
