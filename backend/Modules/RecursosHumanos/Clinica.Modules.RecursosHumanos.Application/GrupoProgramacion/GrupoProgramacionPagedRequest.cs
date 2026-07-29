using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.GrupoProgramacion;

public sealed class GrupoProgramacionPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public Guid? AreaId { get; init; }
}
