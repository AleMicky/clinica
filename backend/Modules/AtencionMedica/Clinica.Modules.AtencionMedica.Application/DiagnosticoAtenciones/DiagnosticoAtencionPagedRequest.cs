using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.DiagnosticoAtenciones;

public sealed class DiagnosticoAtencionPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
}
