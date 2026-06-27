namespace Clinica.Modules.RecursosHumanos.Application.Cargos;

public sealed record UpdateCargoRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
