using Clinica.Modules.RecursosHumanos.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation;

public static class RecursosHumanosEndpoints
{
    private const string BasePath = "/api/recursos-humanos";

    public static IEndpointRouteBuilder MapRecursosHumanosEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        group.MapAreaEndpoints();
        group.MapCargoEndpoints();
        group.MapProfesionEndpoints();
        group.MapEspecialidadEndpoints();
        group.MapDepartamentoEndpoints();
        group.MapServicioEndpoints();
        group.MapJerarquiaEndpoints();

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("RecursosHumanosHealth")
            .WithSummary("Estado del módulo Recursos Humanos")
            .WithTags(RecursosHumanosSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Recursos Humanos operativo.");
    }
}
