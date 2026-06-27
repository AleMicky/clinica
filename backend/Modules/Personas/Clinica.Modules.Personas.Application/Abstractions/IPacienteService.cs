using Clinica.Modules.Personas.Application.Pacientes;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Abstractions;

public interface IPacienteService : ICrudService<Guid,
    PacienteResponse,
    CreatePacienteRequest,
    UpdatePacienteRequest>
{
    Task<PagedResult<PacienteResponse>> GetPagedAsync(
        PacientePagedRequest request,
        CancellationToken cancellationToken = default);
}
