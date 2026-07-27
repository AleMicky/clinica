using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public sealed class SolicitudPagedRequest : PagedRequest
{
    public Guid? PacienteId { get; set; }
    public Guid? AtencionId { get; set; }
    public string? Estado { get; set; }
    public string? Origen { get; set; }
}
