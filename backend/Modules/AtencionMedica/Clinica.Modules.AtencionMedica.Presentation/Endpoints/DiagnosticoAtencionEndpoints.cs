using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.DiagnosticoAtenciones;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class DiagnosticoAtencionEndpoints
{
    public static RouteGroupBuilder MapDiagnosticoAtencionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/diagnostico-atenciones")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.DiagnosticoAtenciones)
            .MapFilteredCrud<
                DiagnosticoAtencionPagedRequest,
                IDiagnosticoAtencionService,
                DiagnosticoAtencionResponse,
                CreateDiagnosticoAtencionRequest,
                UpdateDiagnosticoAtencionRequest>(
                "DiagnosticoAtencion",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
