using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.ResultadosEstudio;

public sealed class ResultadoEstudioPagedRequest : PagedRequest
{
    public Guid? EstudioId { get; set; }
}
