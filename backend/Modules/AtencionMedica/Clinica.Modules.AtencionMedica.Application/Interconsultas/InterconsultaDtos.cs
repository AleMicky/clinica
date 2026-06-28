namespace Clinica.Modules.AtencionMedica.Application.Interconsultas;

public sealed record InterconsultaResponse(
    Guid Id,
    Guid AtencionId,
    Guid EspecialidadId,
    Guid? MedicoId,
    string Motivo,
    string? Respuesta,
    DateTime FechaSolicitud,
    DateTime? FechaRespuesta);

public sealed record CreateInterconsultaRequest(
    Guid AtencionId,
    Guid EspecialidadId,
    Guid? MedicoId = null,
    string Motivo = "",
    string? Respuesta = null,
    DateTime? FechaSolicitud = null,
    DateTime? FechaRespuesta = null);

public sealed record UpdateInterconsultaRequest(
    Guid AtencionId,
    Guid EspecialidadId,
    Guid? MedicoId = null,
    string Motivo = "",
    string? Respuesta = null,
    DateTime? FechaSolicitud = null,
    DateTime? FechaRespuesta = null);
