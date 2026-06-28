using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;

public sealed class FormularioClinicoPagedRequest : PagedRequest
{
    public Guid? TipoAtencionId { get; set; }
}
