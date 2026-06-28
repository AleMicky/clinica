using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.ResultadosEstudio;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class ResultadoEstudioEndpoints
{
    public static RouteGroupBuilder MapResultadoEstudioEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/resultados-estudio")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.ResultadosEstudio)
            .MapFilteredCrud<
                ResultadoEstudioPagedRequest,
                IResultadoEstudioService,
                ResultadoEstudioResponse,
                CreateResultadoEstudioRequest,
                UpdateResultadoEstudioRequest>(
                "ResultadoEstudio",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
