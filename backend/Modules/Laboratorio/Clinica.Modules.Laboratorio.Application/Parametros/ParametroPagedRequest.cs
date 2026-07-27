using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Parametros;

public sealed class ParametroPagedRequest : PagedRequest
{
    public Guid? PruebaId { get; set; }
}
