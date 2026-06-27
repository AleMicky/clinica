namespace Clinica.Modules.Parametros.Application.CatalogoItems;

public sealed record CatalogoItemResponse(
    Guid Id,
    Guid CatalogoGrupoId,
    string Codigo,
    string Nombre,
    string Valor,
    int Orden
);
