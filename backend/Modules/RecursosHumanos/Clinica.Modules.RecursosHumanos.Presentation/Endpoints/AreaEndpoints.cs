using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Areas;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class AreaEndpoints
{
    public static RouteGroupBuilder MapAreaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/areas")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Areas)
            .MapCrud<
                IAreaService,
                Guid,
                AreaResponse,
                CreateAreaRequest,
                UpdateAreaRequest>("Area");

        return group;
    }
}
