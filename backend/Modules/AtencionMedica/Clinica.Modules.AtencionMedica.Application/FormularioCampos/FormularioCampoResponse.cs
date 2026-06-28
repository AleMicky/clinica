namespace Clinica.Modules.AtencionMedica.Application.FormularioCampos;

public sealed record FormularioCampoResponse(
    Guid Id,
    Guid FormularioSeccionId,
    string Codigo,
    string Etiqueta,
    Guid TipoCampoFormularioId,
    bool EsRequerido,
    int Orden,
    string? Placeholder,
    string? ValorDefecto,
    string? OpcionesJson,
    string? ValidacionesJson);
