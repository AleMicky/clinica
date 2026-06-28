using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Prescripciones;

public sealed class PrescripcionPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
}
