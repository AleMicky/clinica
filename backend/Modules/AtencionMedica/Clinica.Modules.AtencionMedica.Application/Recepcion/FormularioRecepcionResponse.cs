namespace Clinica.Modules.AtencionMedica.Application.Recepcion;

public sealed record FormularioRecepcionResponse(
    Guid FormularioClinicoId,
    Guid TipoAtencionId,
    string FormularioCodigo,
    string FormularioNombre,
    IReadOnlyCollection<FormularioRecepcionSeccionResponse> Secciones);

public sealed record FormularioRecepcionSeccionResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    int Orden,
    IReadOnlyCollection<FormularioRecepcionCampoResponse> Campos);

public sealed record FormularioRecepcionCampoResponse(
    Guid Id,
    string Codigo,
    string Etiqueta,
    string TipoCampoCodigo,
    string ControlFrontend,
    string TipoDato,
    bool EsRequerido,
    bool Visible,
    int Orden,
    string? Placeholder,
    string? ValorDefecto,
    string? OpcionesJson);
