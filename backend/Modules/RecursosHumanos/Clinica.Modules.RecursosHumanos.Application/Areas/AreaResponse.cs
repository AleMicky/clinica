namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public sealed record AreaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion
);
