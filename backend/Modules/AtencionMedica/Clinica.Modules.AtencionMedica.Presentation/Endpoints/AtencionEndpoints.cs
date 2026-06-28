using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class AtencionEndpoints
{
    public static RouteGroupBuilder MapAtencionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/atenciones")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Atenciones)
            .MapFilteredCrud<
                AtencionPagedRequest,
                IAtencionService,
                AtencionResponse,
                CreateAtencionRequest,
                UpdateAtencionRequest>(
                "Atencion",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
