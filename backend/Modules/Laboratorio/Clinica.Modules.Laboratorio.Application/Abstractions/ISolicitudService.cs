using Clinica.Modules.Laboratorio.Application.Solicitudes;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface ISolicitudService
{
    Task<PagedResult<SolicitudResponse>> GetPagedAsync(
        SolicitudPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<SolicitudResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<SolicitudResponse> CreateAsync(
        CreateSolicitudRequest request,
        CancellationToken cancellationToken = default);

    Task<SolicitudResponse> EnviarACajaAsync(
        Guid id,
        EnviarACajaRequest request,
        CancellationToken cancellationToken = default);

    Task<SolicitudDetalleResponse> DerivarDetalleAsync(
        Guid solicitudId,
        Guid detalleId,
        DerivarDetalleRequest request,
        CancellationToken cancellationToken = default);

    Task SetEstadoAsync(
        Guid id,
        string estado,
        CancellationToken cancellationToken = default);
}
