using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class FormularioClinicoEndpoints
{
    public static RouteGroupBuilder MapFormularioClinicoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/formularios-clinicos")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.FormulariosClinicos)
            .MapFilteredCrud<
                FormularioClinicoPagedRequest,
                IFormularioClinicoService,
                FormularioClinicoResponse,
                CreateFormularioClinicoRequest,
                UpdateFormularioClinicoRequest>(
                "FormularioClinico",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
