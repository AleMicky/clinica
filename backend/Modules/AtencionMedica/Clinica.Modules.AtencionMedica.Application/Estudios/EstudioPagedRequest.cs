using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Estudios;

public sealed class EstudioPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
    public string? Estado { get; set; }
}
