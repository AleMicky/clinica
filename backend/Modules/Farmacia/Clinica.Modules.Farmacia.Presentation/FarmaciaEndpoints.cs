using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Dispensaciones;
using Clinica.Modules.Farmacia.Application.Precios;
using Clinica.Modules.Farmacia.Application.Recetas;
using Clinica.Modules.Farmacia.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Farmacia.Presentation;

public static class FarmaciaEndpoints
{
    private const string BasePath = "/api/farmacia";

    public static IEndpointRouteBuilder MapFarmaciaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);
        group.MapGet("/health", () => ApiResults.Ok("Farmacia operativa."))
            .WithName("FarmaciaHealth")
            .WithTags(FarmaciaSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

        group.MapPrecioEndpoints();
        group.MapRecetaEndpoints();
        group.MapDispensacionEndpoints();
        return app;
    }
}

public static class FarmaciaSwaggerTags
{
    public const string Module = "Farmacia";
    public const string Precios = "Farmacia · Precios";
    public const string Recetas = "Farmacia · Recetas";
    public const string Dispensaciones = "Farmacia · Dispensaciones";
}
