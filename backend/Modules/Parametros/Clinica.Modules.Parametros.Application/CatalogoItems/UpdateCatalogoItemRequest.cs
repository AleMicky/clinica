namespace Clinica.Modules.Parametros.Application.CatalogoItems;

public sealed record UpdateCatalogoItemRequest(
    Guid CatalogoGrupoId,
    string Codigo,
    string Nombre,
    string Valor,
    int Orden = 0
);
