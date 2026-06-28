using Clinica.Modules.AtencionMedica.Application.Prescripciones;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IPrescripcionService : ICrudService<Guid,
    PrescripcionResponse,
    CreatePrescripcionRequest,
    UpdatePrescripcionRequest>
{
    Task<PagedResult<PrescripcionResponse>> GetPagedAsync(
        PrescripcionPagedRequest request,
        CancellationToken cancellationToken = default);
}
