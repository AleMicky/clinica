using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Muestras;

public sealed class MuestraPagedRequest : PagedRequest
{
    public Guid? SolicitudId { get; set; }
}
