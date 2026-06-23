using Clinica.Modules.Seguridad.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation;

public static class SeguridadEndpoints
{
    public const string BasePath = "/api/seguridad";
    public const string AdminPolicy = "Seguridad.Admin";

    public static IEndpointRouteBuilder MapSeguridadEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        group.MapGet("/health", HealthCheck)
            .WithName("Seguridad_Health")
            .WithSummary("Verifica el estado del módulo Seguridad")
            .WithTags(SeguridadSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK);

        group.MapAuthEndpoints();
        group.MapRoleEndpoints();
        group.MapUserEndpoints();

        return app;
    }

    private static IResult HealthCheck()
    {
        return ApiResults.Ok("Seguridad operativo.");
    }
}