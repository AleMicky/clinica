namespace Clinica.Modules.RecursosHumanos.Application.TiposArea;

public sealed record CreateTipoAreaRequest(
    string Codigo,
    string Nombre,
    string Descripcion = "",
    int Orden = 0
);
