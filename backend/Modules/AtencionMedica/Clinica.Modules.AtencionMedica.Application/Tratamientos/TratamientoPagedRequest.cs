using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Tratamientos;

public sealed class TratamientoPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
}
