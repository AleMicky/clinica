namespace Clinica.Modules.Almacen.Application.FormasFarmaceuticas;

public sealed record FormaFarmaceuticaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion);

public sealed record CreateFormaFarmaceuticaRequest(
    string Codigo,
    string Nombre,
    string? Descripcion = null);

public sealed record UpdateFormaFarmaceuticaRequest(
    string Codigo,
    string Nombre,
    string? Descripcion);
