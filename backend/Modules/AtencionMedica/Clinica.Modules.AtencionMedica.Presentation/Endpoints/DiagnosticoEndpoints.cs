using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Diagnosticos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class DiagnosticoEndpoints
{
    public static RouteGroupBuilder MapDiagnosticoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/diagnosticos")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Diagnosticos)
            .MapFilteredCrud<
                DiagnosticoPagedRequest,
                IDiagnosticoService,
                DiagnosticoResponse,
                CreateDiagnosticoRequest,
                UpdateDiagnosticoRequest>(
                "Diagnostico",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
