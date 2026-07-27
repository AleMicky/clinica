using Clinica.Modules.Laboratorio.Application.Parametros;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IParametroService : ICrudService<Guid,
    ParametroResponse,
    CreateParametroRequest,
    UpdateParametroRequest>
{
    Task<PagedResult<ParametroResponse>> GetPagedAsync(
        ParametroPagedRequest request,
        CancellationToken cancellationToken = default);
}
