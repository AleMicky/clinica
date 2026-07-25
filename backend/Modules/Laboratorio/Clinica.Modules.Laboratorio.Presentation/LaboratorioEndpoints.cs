using Clinica.Modules.Laboratorio.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation;

public static class LaboratorioEndpoints
{
    private const string BasePath = "/api/laboratorio";

    public static IEndpointRouteBuilder MapLaboratorioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        group.MapEspecialidadEndpoints();
        group.MapTipoExamenEndpoints();

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("LaboratorioHealth")
            .WithSummary("Estado del módulo Laboratorio")
            .WithTags(LaboratorioSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Laboratorio operativo.");
    }
}
