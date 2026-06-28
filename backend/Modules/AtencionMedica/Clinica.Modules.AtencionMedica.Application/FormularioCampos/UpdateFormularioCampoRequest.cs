namespace Clinica.Modules.AtencionMedica.Application.FormularioCampos;

public sealed record UpdateFormularioCampoRequest(
    Guid FormularioSeccionId,
    string Codigo,
    string Etiqueta,
    Guid TipoCampoFormularioId,
    bool EsRequerido,
    int Orden,
    string? Placeholder = null,
    string? ValorDefecto = null,
    string? OpcionesJson = null,
    string? ValidacionesJson = null,
    bool Visible = true);
