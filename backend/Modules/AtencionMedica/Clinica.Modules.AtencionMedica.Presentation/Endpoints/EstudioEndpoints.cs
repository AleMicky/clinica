using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Estudios;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class EstudioEndpoints
{
    public static RouteGroupBuilder MapEstudioEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/estudios")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Estudios)
            .MapFilteredCrud<
                EstudioPagedRequest,
                IEstudioService,
                EstudioResponse,
                CreateEstudioRequest,
                UpdateEstudioRequest>(
                "Estudio",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
