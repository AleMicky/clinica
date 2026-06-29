using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.AtencionFlujo;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class AtencionFlujoEndpoints
{
    public static RouteGroupBuilder MapAtencionFlujoEndpoints(this RouteGroupBuilder group)
    {
        var flujoGroup = group.MapGroup("/atenciones/{atencionId:guid}/flujo")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Atenciones);

        flujoGroup.MapGet("/completitud", async (
                Guid atencionId,
                IAtencionFlujoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetCompletitudAsync(atencionId, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("AtencionFlujo_GetCompletitud")
            .WithSummary("Completitud del formulario clínico por etapa")
            .Produces<ApiResponse<AtencionFlujoCompletitudResponse>>(StatusCodes.Status200OK);

        flujoGroup.MapPost("/avanzar", async (
                Guid atencionId,
                IAtencionFlujoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.AvanzarFlujoAsync(atencionId, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("AtencionFlujo_Avanzar")
            .WithSummary("Avanza la atención al siguiente estado del workflow")
            .Produces<ApiResponse<AvanzarAtencionFlujoResponse>>(StatusCodes.Status200OK);

        return group;
    }
}
