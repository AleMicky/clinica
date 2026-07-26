namespace Clinica.Modules.RecursosHumanos.Application.TiposArea;

public sealed record UpdateTipoAreaRequest(
    string Codigo,
    string Nombre,
    string Descripcion = "",
    int Orden = 0
);
