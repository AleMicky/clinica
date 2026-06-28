using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Interconsultas;

public sealed class InterconsultaPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
}
