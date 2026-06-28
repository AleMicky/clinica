using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class AtencionFormularioRespuestaEndpoints
{
    public static RouteGroupBuilder MapAtencionFormularioRespuestaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/atencion-respuestas")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.AtencionRespuestas)
            .MapFilteredCrud<
                AtencionFormularioRespuestaPagedRequest,
                IAtencionFormularioRespuestaService,
                AtencionFormularioRespuestaResponse,
                CreateAtencionFormularioRespuestaRequest,
                UpdateAtencionFormularioRespuestaRequest>(
                "AtencionFormularioRespuesta",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
