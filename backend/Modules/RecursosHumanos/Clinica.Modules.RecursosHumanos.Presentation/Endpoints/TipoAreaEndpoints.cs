using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.TiposArea;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class TipoAreaEndpoints
{
    public static RouteGroupBuilder MapTipoAreaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/tipos-area")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.TiposArea)
            .MapCrud<
                ITipoAreaService,
                Guid,
                TipoAreaResponse,
                CreateTipoAreaRequest,
                UpdateTipoAreaRequest>("TipoArea");

        return group;
    }
}
