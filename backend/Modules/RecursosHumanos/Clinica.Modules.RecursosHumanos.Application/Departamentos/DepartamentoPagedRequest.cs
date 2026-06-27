using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Departamentos;

public sealed class DepartamentoPagedRequest : PagedRequest
{
    public Guid? AreaId { get; init; }
}
