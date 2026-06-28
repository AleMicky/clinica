using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.SignosVitales;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class SignoVitalEndpoints
{
    public static RouteGroupBuilder MapSignoVitalEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/signos-vitales")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.SignosVitales)
            .MapFilteredCrud<
                SignoVitalPagedRequest,
                ISignoVitalService,
                SignoVitalResponse,
                CreateSignoVitalRequest,
                UpdateSignoVitalRequest>(
                "SignoVital",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
