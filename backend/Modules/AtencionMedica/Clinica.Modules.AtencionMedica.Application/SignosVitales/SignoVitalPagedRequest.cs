using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.SignosVitales;

public sealed class SignoVitalPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
}
