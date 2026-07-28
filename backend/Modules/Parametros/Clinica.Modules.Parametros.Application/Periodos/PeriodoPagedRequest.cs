using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Parametros.Application.Periodos;

public sealed class PeriodoPagedRequest : PagedRequest
{
    public Guid? GestionId { get; set; }
}
