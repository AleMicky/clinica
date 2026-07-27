using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Farmacia.Application.Dispensaciones;

public sealed record DispensacionDetalleRequest(Guid ProductoId, decimal Cantidad);
public sealed record CreateDispensacionRequest(Guid PacienteId, IReadOnlyList<DispensacionDetalleRequest> Detalles, Guid? RecetaId = null, string? Observaciones = null, Guid? EmpleadoId = null);
public sealed record ConfirmarDispensacionRequest(Guid? EmpleadoId = null);
public sealed record DispensacionDetalleResponse(Guid Id, Guid ProductoId, decimal Cantidad, decimal PrecioUnitario, Guid? LoteId);
public sealed record DispensacionResponse(Guid Id, string Numero, Guid? RecetaId, Guid PacienteId, DateTime Fecha, string Estado, Guid? CuentaId, Guid? WorkflowInstanceId, string? Observaciones, IReadOnlyList<DispensacionDetalleResponse> Detalles);
public sealed record DispensacionListItemResponse(Guid Id, string Numero, Guid PacienteId, DateTime Fecha, string Estado, Guid? CuentaId);

public sealed class DispensacionPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public Guid? PacienteId { get; set; }
    public string? Estado { get; set; }
}
