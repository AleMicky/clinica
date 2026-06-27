using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Parametros.Application.CatalogoItems;

public sealed class CatalogoItemPagedRequest : PagedRequest
{
    public Guid? CatalogoGrupoId { get; set; }
}
