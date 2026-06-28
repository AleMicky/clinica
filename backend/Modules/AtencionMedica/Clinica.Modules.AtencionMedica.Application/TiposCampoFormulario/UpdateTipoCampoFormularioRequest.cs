namespace Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;

public sealed record UpdateTipoCampoFormularioRequest(
    string Codigo,
    string Nombre,
    string ControlFrontend,
    string TipoDato,
    bool PermiteOpciones = false,
    bool PermiteValorDefecto = false,
    bool PermiteValidaciones = false,
    bool PermiteMultiple = false);
