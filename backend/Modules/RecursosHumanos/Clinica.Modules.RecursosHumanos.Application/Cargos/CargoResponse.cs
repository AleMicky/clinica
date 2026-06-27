namespace Clinica.Modules.RecursosHumanos.Application.Cargos;

public sealed record CargoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion
);
