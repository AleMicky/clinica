namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public sealed record CreateAreaRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
