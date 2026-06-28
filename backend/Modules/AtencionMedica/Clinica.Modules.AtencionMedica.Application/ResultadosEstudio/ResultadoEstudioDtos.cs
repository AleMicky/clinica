namespace Clinica.Modules.AtencionMedica.Application.ResultadosEstudio;

public sealed record ResultadoEstudioResponse(
    Guid Id,
    Guid EstudioId,
    string ResultadoTexto,
    string? ArchivoUrl,
    DateTime FechaResultado,
    Guid? RegistradoPorId,
    string? Observaciones);

public sealed record CreateResultadoEstudioRequest(
    Guid EstudioId,
    string ResultadoTexto,
    string? ArchivoUrl = null,
    DateTime? FechaResultado = null,
    Guid? RegistradoPorId = null,
    string? Observaciones = null);

public sealed record UpdateResultadoEstudioRequest(
    Guid EstudioId,
    string ResultadoTexto,
    string? ArchivoUrl = null,
    DateTime? FechaResultado = null,
    Guid? RegistradoPorId = null,
    string? Observaciones = null);
