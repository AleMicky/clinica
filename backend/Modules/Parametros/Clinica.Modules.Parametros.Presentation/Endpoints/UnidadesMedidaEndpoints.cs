using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.UnidadesMedida;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation.Endpoints;

public static class UnidadesMedidaEndpoints
{
    public static RouteGroupBuilder MapUnidadesMedidaEndpoints(
        this RouteGroupBuilder group)
    {
        group.MapGroup("/unidades-medida")
            .RequireAuthorization()
            .WithTags(ParametrosSwaggerTags.UnidadesMedida)
            .MapCrud<
                IUnidadesMedidaService,
                Guid,
                UnidadesMedidaResponse,
                CreateUnidadesMedidaRequest,
                UpdateUnidadesMedidaRequest>("UnidadesMedida");

        return group;
    }
}
