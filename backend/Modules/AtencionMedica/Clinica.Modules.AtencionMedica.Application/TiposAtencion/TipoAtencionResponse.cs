namespace Clinica.Modules.AtencionMedica.Application.TiposAtencion;

public sealed record TipoAtencionResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion);
