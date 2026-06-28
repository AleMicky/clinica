namespace Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;

public sealed record AtencionFormularioRespuestaResponse(
    Guid Id,
    Guid AtencionId,
    Guid FormularioCampoId,
    string? ValorTexto,
    decimal? ValorNumero,
    DateTime? ValorFecha,
    bool? ValorBooleano,
    string? ValorJson);
