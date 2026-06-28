namespace Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;

public sealed record UpdateFormularioClinicoRequest(
    Guid TipoAtencionId,
    string Codigo,
    string Nombre,
    string Descripcion = "",
    int Version = 1,
    bool Activo = true);
