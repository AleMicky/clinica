using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.FormularioSecciones;

public sealed class FormularioSeccionPagedRequest : PagedRequest
{
    public Guid? FormularioClinicoId { get; set; }
}
