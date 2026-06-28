using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.PrescripcionDetalles;

public sealed class PrescripcionDetallePagedRequest : PagedRequest
{
    public Guid? PrescripcionId { get; set; }
}
