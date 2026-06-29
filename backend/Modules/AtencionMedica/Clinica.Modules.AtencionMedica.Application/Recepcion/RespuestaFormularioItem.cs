namespace Clinica.Modules.AtencionMedica.Application.Recepcion;

public sealed record RespuestaFormularioItem(
    Guid FormularioCampoId,
    string? ValorTexto = null,
    decimal? ValorNumero = null,
    DateTime? ValorFecha = null,
    bool? ValorBooleano = null,
    string? ValorJson = null);
