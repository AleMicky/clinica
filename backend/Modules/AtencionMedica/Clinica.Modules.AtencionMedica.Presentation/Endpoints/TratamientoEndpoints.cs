using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Tratamientos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class TratamientoEndpoints
{
    public static RouteGroupBuilder MapTratamientoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/tratamientos")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Tratamientos)
            .MapFilteredCrud<
                TratamientoPagedRequest,
                ITratamientoService,
                TratamientoResponse,
                CreateTratamientoRequest,
                UpdateTratamientoRequest>(
                "Tratamiento",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
