using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Parametros;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class ParametroEndpoints
{
    public static RouteGroupBuilder MapParametroEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/parametros")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Parametros)
            .MapFilteredCrud<
                ParametroPagedRequest,
                IParametroService,
                ParametroResponse,
                CreateParametroRequest,
                UpdateParametroRequest>(
                "LaboratorioParametro",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
