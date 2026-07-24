namespace Clinica.Modules.AtencionMedica.Application.TiposAtencion;

public sealed record CreateTipoAtencionRequest(
    string Codigo,
    string Nombre,
    string Descripcion = "",
    string Color = "#1677ff",
    string? Icono = null);
