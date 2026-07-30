namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public sealed record UpdateSolicitudRequest(
    Guid PacienteId,
    string Origen,
    Guid? AtencionId,
    Guid? MedicoSolicitanteId,
    string? MedicoExternoNombre,
    string? Observaciones,
    IReadOnlyList<CreateSolicitudLineaRequest> Lineas
);
