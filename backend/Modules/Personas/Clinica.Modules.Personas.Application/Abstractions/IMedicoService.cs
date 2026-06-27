using Clinica.Modules.Personas.Application.Medicos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Abstractions;

public interface IMedicoService : ICrudService<Guid,
    MedicoResponse,
    CreateMedicoRequest,
    UpdateMedicoRequest>
{
    Task<PagedResult<MedicoResponse>> GetPagedAsync(
        MedicoPagedRequest request,
        CancellationToken cancellationToken = default);
}
