namespace Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;

public sealed record TipoCampoFormularioResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string ControlFrontend,
    string TipoDato,
    bool PermiteOpciones,
    bool PermiteValorDefecto,
    bool PermiteValidaciones,
    bool PermiteMultiple);
