namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public sealed record UpdateAreaRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
