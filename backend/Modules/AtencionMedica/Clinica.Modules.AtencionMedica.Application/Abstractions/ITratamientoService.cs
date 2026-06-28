using Clinica.Modules.AtencionMedica.Application.Tratamientos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface ITratamientoService : ICrudService<Guid,
    TratamientoResponse,
    CreateTratamientoRequest,
    UpdateTratamientoRequest>
{
    Task<PagedResult<TratamientoResponse>> GetPagedAsync(
        TratamientoPagedRequest request,
        CancellationToken cancellationToken = default);
}
