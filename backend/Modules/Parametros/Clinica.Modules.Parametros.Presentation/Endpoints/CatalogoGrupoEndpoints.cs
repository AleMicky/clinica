using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation.Endpoints;

public static class CatalogoGrupoEndpoints
{
    public static RouteGroupBuilder MapCatalogoGrupoEndpoints(
        this RouteGroupBuilder group)
    {
        group.MapGroup("/catalogo-grupos")
            .RequireAuthorization()
            .WithTags(ParametrosSwaggerTags.CatalogoGrupos)
            .MapCrud<
                ICatalogoGrupoService,
                Guid,
                CatalogoGrupoResponse,
                CreateCatalogoGrupoRequest,
                UpdateCatalogoGrupoRequest>("CatalogoGrupo");

        return group;
    }
}