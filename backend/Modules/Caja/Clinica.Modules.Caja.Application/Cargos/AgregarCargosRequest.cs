namespace Clinica.Modules.Caja.Application.Cargos;

public sealed record AgregarCargosLineaRequest(
    string Concepto,
    string? Codigo,
    decimal Cantidad,
    decimal MontoUnitario,
    Guid? ReferenciaLineaId);

public sealed record AgregarCargosRequest(
    Guid PacienteId,
    string ModuloOrigen,
    string EntidadOrigen,
    Guid ReferenciaId,
    Guid? WorkflowInstanceId,
    string? Observaciones,
    IReadOnlyList<AgregarCargosLineaRequest> Lineas);
