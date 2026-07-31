using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Muestras;

public sealed class MuestraPagedRequest : PagedRequest
{
    public Guid? SolicitudId { get; set; }
    public string? Estado { get; set; }
    public string? Search { get; set; }
}
