using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed class AtencionPagedRequest : PagedRequest
{
    public Guid? PacienteId { get; set; }
    public Guid? TipoAtencionId { get; set; }
}
