using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Interconsultas;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class InterconsultaEndpoints
{
    public static RouteGroupBuilder MapInterconsultaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/interconsultas")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Interconsultas)
            .MapFilteredCrud<
                InterconsultaPagedRequest,
                IInterconsultaService,
                InterconsultaResponse,
                CreateInterconsultaRequest,
                UpdateInterconsultaRequest>(
                "Interconsulta",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
