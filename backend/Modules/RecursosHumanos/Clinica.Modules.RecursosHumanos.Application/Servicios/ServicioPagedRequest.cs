using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Servicios;

public sealed class ServicioPagedRequest : PagedRequest
{
    public Guid? DepartamentoId { get; init; }
}
