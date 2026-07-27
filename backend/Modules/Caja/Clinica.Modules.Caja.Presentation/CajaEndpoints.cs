using Clinica.Modules.Caja.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Caja.Presentation;

public static class CajaEndpoints
{
    private const string BasePath = "/api/caja";

    public static IEndpointRouteBuilder MapCajaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);

        MapHealth(group);
        group.MapCajaFisicaEndpoints();
        group.MapTurnoCajaEndpoints();
        group.MapCuentaEndpoints();
        group.MapPagoEndpoints();
        group.MapMovimientoEndpoints();
        group.MapCatalogoEndpoints();

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", () => ApiResults.Ok("Caja operativa."))
            .WithName("CajaHealth")
            .WithSummary("Estado del módulo Caja")
            .WithTags(CajaSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }
}
