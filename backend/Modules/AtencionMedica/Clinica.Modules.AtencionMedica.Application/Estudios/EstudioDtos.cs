namespace Clinica.Modules.AtencionMedica.Application.Estudios;

public sealed record EstudioResponse(
    Guid Id,
    Guid AtencionId,
    Guid TipoEstudioId,
    string Nombre,
    string? Justificacion,
    string Estado,
    DateTime FechaSolicitud);

public sealed record CreateEstudioRequest(
    Guid AtencionId,
    Guid TipoEstudioId,
    string Nombre,
    string? Justificacion = null,
    string Estado = "SOLICITADO",
    DateTime? FechaSolicitud = null);

public sealed record UpdateEstudioRequest(
    Guid AtencionId,
    Guid TipoEstudioId,
    string Nombre,
    string? Justificacion = null,
    string Estado = "SOLICITADO",
    DateTime? FechaSolicitud = null);
