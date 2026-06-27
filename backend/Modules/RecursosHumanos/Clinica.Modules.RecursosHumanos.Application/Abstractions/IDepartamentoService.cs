using Clinica.Modules.RecursosHumanos.Application.Departamentos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface IDepartamentoService : ICrudService<Guid,
    DepartamentoResponse,
    CreateDepartamentoRequest,
    UpdateDepartamentoRequest>
{
    Task<PagedResult<DepartamentoResponse>> GetPagedAsync(
        DepartamentoPagedRequest request,
        CancellationToken cancellationToken = default);
}
