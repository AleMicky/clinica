using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Jerarquia;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class JerarquiaEndpoints
{
    public static RouteGroupBuilder MapJerarquiaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/jerarquia", async (
                [AsParameters] JerarquiaOrganizacionalRequest request,
                IJerarquiaOrganizacionalService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .RequireAuthorization()
            .WithName("Jerarquia_GetOrganizacional")
            .WithSummary("Jerarquía organizacional completa")
            .WithTags(RecursosHumanosSwaggerTags.Jerarquia)
            .Produces<ApiResponse<JerarquiaOrganizacionalResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

        return group;
    }
}
