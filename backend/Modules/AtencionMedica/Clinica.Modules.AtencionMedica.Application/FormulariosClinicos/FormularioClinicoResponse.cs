namespace Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;

public sealed record FormularioClinicoResponse(
    Guid Id,
    Guid TipoAtencionId,
    string Codigo,
    string Nombre,
    string Descripcion,
    int Version,
    bool Activo);
