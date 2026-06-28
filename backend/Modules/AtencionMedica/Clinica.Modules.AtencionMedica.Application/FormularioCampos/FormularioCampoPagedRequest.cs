using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.FormularioCampos;

public sealed class FormularioCampoPagedRequest : PagedRequest
{
    public Guid? FormularioSeccionId { get; set; }
}
