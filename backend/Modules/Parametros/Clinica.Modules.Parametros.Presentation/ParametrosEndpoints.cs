using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation;

public static class ParametrosEndpoints
{
    private const string BasePath = "/api/parametros";
    private const string AdminPolicy = "AdminOnly";

    public static IEndpointRouteBuilder MapParametrosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath)
            .WithTags("Parametros");

        MapHealth(group);

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("ParametrosHealth")
            .WithSummary("Estado del módulo Parámetros")
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    
    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Seguridad operativo.");
    }
    
}
