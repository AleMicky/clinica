namespace Clinica.Modules.RecursosHumanos.Application.TiposArea;

public sealed record TipoAreaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion,
    int Orden
);
