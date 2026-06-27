namespace Clinica.Modules.RecursosHumanos.Application.Cargos;

public sealed record CreateCargoRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
