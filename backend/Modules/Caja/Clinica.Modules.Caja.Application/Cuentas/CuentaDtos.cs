namespace Clinica.Modules.Caja.Application.Cuentas;

public sealed record CargoResponse(
    Guid Id,
    string Concepto,
    string? Codigo,
    decimal Cantidad,
    decimal MontoUnitario,
    decimal MontoTotal,
    string ModuloOrigen,
    string EntidadOrigen,
    Guid ReferenciaId,
    Guid? ReferenciaLineaId,
    DateTime CreatedAt);

public sealed record PagoResponse(
    Guid Id,
    string? Numero,
    decimal Monto,
    string? MetodoPago,
    string Estado,
    DateTime FechaPago,
    string? Observaciones,
    DateTime CreatedAt);

public sealed record CuentaResponse(
    Guid Id,
    string Numero,
    Guid PacienteId,
    string ModuloOrigen,
    string EntidadOrigen,
    Guid ReferenciaId,
    Guid? WorkflowInstanceId,
    string Estado,
    decimal TotalCargos,
    decimal TotalPagado,
    decimal Saldo,
    string? Observaciones,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<CargoResponse> Cargos,
    IReadOnlyList<PagoResponse> Pagos);

public sealed record CuentaListItemResponse(
    Guid Id,
    string Numero,
    Guid PacienteId,
    string ModuloOrigen,
    string EntidadOrigen,
    Guid ReferenciaId,
    Guid? WorkflowInstanceId,
    string Estado,
    decimal TotalCargos,
    decimal TotalPagado,
    decimal Saldo,
    DateTime CreatedAt);
