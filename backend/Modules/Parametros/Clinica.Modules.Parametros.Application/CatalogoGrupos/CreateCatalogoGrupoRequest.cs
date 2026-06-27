namespace Clinica.Modules.Parametros.Application.CatalogoGrupos;

public sealed record CreateCatalogoGrupoRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);