using Clinica.Modules.AtencionMedica.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation;

public static class AtencionMedicaEndpoints
{
    private const string BasePath = "/api/atencion-medica";

    public static IEndpointRouteBuilder MapAtencionMedicaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        group.MapTipoAtencionEndpoints();
        group.MapTipoCampoFormularioEndpoints();
        group.MapFormularioClinicoEndpoints();
        group.MapFormularioSeccionEndpoints();
        group.MapFormularioCampoEndpoints();
        group.MapAtencionEndpoints();
        group.MapBandejaAtencionEndpoints();
        group.MapAtencionFormularioRespuestaEndpoints();

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", HealthCheck)
            .WithName("AtencionMedicaHealth")
            .WithSummary("Estado del módulo Atención Médica")
            .WithTags(AtencionMedicaSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Atención Médica operativa.");
    }
}
