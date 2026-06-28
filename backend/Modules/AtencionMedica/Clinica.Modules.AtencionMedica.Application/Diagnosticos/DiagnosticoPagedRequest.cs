using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Diagnosticos;

public sealed class DiagnosticoPagedRequest : PagedRequest
{
    public string? Busqueda { get; set; }
}
