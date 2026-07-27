namespace Clinica.Modules.Laboratorio.Application.Parametros;

public sealed record ParametroResponse(
    Guid Id,
    Guid PruebaId,
    string PruebaNombre,
    string Codigo,
    string Nombre,
    Guid? UnidadMedidaId,
    string TipoDato,
    int Orden,
    bool Activo
);
