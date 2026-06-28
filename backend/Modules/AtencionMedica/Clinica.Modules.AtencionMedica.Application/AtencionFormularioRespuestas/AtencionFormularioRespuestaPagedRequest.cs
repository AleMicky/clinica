using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;

public sealed class AtencionFormularioRespuestaPagedRequest : PagedRequest
{
    public Guid? AtencionId { get; set; }
}
