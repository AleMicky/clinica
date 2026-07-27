namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public sealed record CreateSolicitudLineaRequest(
    Guid PruebaId,
    decimal Cantidad = 1,
    string? Observaciones = null
);

public sealed record CreateSolicitudRequest(
    Guid PacienteId,
    string Origen,
    Guid? AtencionId,
    Guid? MedicoSolicitanteId,
    string? MedicoExternoNombre,
    string? Observaciones,
    Guid EmpleadoId,
    IReadOnlyList<CreateSolicitudLineaRequest> Lineas
);
