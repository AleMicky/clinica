namespace Clinica.Modules.Laboratorio.Application.Parametros;

public sealed record CreateParametroRequest(
    Guid PruebaId,
    string Codigo,
    string Nombre,
    Guid? UnidadMedidaId,
    string TipoDato = "NUMERICO",
    int Orden = 0,
    bool Activo = true
);
