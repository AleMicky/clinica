using Clinica.Modules.Parametros.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation;

public static class ParametrosEndpoints
{
    private const string BasePath = "/api/parametros";

    public static IEndpointRouteBuilder MapParametrosEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        MapCatalogoGrupoEndpoints(group);
        MapCatalogoItemEndpoints(group);
        MapCorrelativoEndpoints(group);

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("ParametrosHealth")
            .WithSummary("Estado del módulo Parámetros")
            .WithTags(ParametrosSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static void MapCatalogoGrupoEndpoints(RouteGroupBuilder group)
    {
        group.MapCatalogoGrupoEndpoints();
    }

    private static void MapCatalogoItemEndpoints(RouteGroupBuilder group)
    {
        group.MapCatalogoItemEndpoints();
    }

    private static void MapCorrelativoEndpoints(RouteGroupBuilder group)
    {
        group.MapCorrelativoEndpoints();
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Parámetros operativo.");
    }
}