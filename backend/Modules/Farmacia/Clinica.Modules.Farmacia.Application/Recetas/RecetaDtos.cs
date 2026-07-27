using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Farmacia.Application.Recetas;

public sealed record RecetaDetalleRequest(Guid ProductoId, decimal Cantidad, string? Indicaciones = null);
public sealed record CreateRecetaRequest(Guid PacienteId, IReadOnlyList<RecetaDetalleRequest> Detalles, Guid? MedicoId = null, Guid? AtencionId = null, bool EsExterna = false, string? Observaciones = null);
public sealed record RecetaDetalleResponse(Guid Id, Guid ProductoId, decimal Cantidad, string? Indicaciones);
public sealed record RecetaResponse(Guid Id, string Numero, Guid PacienteId, Guid? MedicoId, Guid? AtencionId, bool EsExterna, DateTime Fecha, string Estado, string? Observaciones, Guid? WorkflowInstanceId, IReadOnlyList<RecetaDetalleResponse> Detalles);
public sealed record RecetaListItemResponse(Guid Id, string Numero, Guid PacienteId, bool EsExterna, DateTime Fecha, string Estado);

public sealed class RecetaPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public Guid? PacienteId { get; set; }
    public string? Estado { get; set; }
}
