using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Gestiones;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation.Endpoints;

public static class GestionEndpoints
{
    public static RouteGroupBuilder MapGestionEndpoints(
        this RouteGroupBuilder group)
    {
        group.MapGroup("/gestiones")
            .RequireAuthorization()
            .WithTags(ParametrosSwaggerTags.Gestiones)
            .MapCrud<
                IGestionService,
                Guid,
                GestionResponse,
                CreateGestionRequest,
                UpdateGestionRequest>("Gestiones");

        return group;
    }
}
