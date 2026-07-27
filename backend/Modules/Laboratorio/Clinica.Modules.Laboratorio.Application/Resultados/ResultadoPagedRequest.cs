using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Resultados;

public sealed class ResultadoPagedRequest : PagedRequest
{
    public Guid? SolicitudId { get; set; }
}
