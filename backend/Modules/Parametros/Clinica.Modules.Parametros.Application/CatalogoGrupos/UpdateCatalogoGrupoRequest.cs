namespace Clinica.Modules.Parametros.Application.CatalogoGrupos;

public sealed record UpdateCatalogoGrupoRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);