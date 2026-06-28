namespace Clinica.Modules.AtencionMedica.Application.TiposAtencion;

public sealed record UpdateTipoAtencionRequest(
    string Codigo,
    string Nombre,
    string Descripcion = "");
