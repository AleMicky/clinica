using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Prescripciones;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class PrescripcionEndpoints
{
    public static RouteGroupBuilder MapPrescripcionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/prescripciones")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Prescripciones)
            .MapFilteredCrud<
                PrescripcionPagedRequest,
                IPrescripcionService,
                PrescripcionResponse,
                CreatePrescripcionRequest,
                UpdatePrescripcionRequest>(
                "Prescripcion",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
