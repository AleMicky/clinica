namespace Clinica.Modules.AtencionMedica.Application.Prescripciones;

public sealed record PrescripcionResponse(
    Guid Id,
    Guid AtencionId,
    DateTime Fecha,
    string? Observaciones);

public sealed record CreatePrescripcionRequest(
    Guid AtencionId,
    DateTime? Fecha = null,
    string? Observaciones = null);

public sealed record UpdatePrescripcionRequest(
    Guid AtencionId,
    DateTime? Fecha = null,
    string? Observaciones = null);
