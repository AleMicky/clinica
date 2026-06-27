namespace Clinica.Modules.Parametros.Application.CatalogoGrupos;

public sealed record CatalogoGrupoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion
);