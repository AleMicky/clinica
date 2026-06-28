namespace Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;

public sealed record UpdateAtencionFormularioRespuestaRequest(
    Guid AtencionId,
    Guid FormularioCampoId,
    string? ValorTexto = null,
    decimal? ValorNumero = null,
    DateTime? ValorFecha = null,
    bool? ValorBooleano = null,
    string? ValorJson = null);
