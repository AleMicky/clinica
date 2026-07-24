using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Parametros.Application.Correlativos;

public sealed class CorrelativoPagedRequest : PagedRequest
{
    public string? Codigo { get; set; }
    public int? Gestion { get; set; }
}
