using Clinica.Modules.AtencionMedica.Application.PrescripcionDetalles;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IPrescripcionDetalleService : ICrudService<Guid,
    PrescripcionDetalleResponse,
    CreatePrescripcionDetalleRequest,
    UpdatePrescripcionDetalleRequest>
{
    Task<PagedResult<PrescripcionDetalleResponse>> GetPagedAsync(
        PrescripcionDetallePagedRequest request,
        CancellationToken cancellationToken = default);
}
