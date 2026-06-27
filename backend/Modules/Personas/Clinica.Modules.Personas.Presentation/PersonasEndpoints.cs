using Clinica.Modules.Personas.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Personas.Presentation;

public static class PersonasEndpoints
{
    private const string BasePath = "/api/personas";

    public static IEndpointRouteBuilder MapPersonasEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        group.MapPersonaEndpoints();
        group.MapPacienteEndpoints();
        group.MapEmpleadoEndpoints();
        group.MapMedicoEndpoints();
        group.MapContactoEmergenciaEndpoints();

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("PersonasHealth")
            .WithSummary("Estado del módulo Personas")
            .WithTags(PersonasSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Personas operativo.");
    }
}
