using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.PruebaPrecios;

public sealed class PruebaPrecioPagedRequest : PagedRequest
{
    public Guid? PruebaId { get; set; }
}
