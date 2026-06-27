using Clinica.Modules.Personas.Application.Empleados;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Abstractions;

public interface IEmpleadoService : ICrudService<Guid,
    EmpleadoResponse,
    CreateEmpleadoRequest,
    UpdateEmpleadoRequest>
{
    Task<PagedResult<EmpleadoResponse>> GetPagedAsync(
        EmpleadoPagedRequest request,
        CancellationToken cancellationToken = default);
}
