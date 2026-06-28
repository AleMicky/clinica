using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormularioSecciones;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class FormularioSeccionEndpoints
{
    public static RouteGroupBuilder MapFormularioSeccionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/formulario-secciones")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.FormularioSecciones)
            .MapFilteredCrud<
                FormularioSeccionPagedRequest,
                IFormularioSeccionService,
                FormularioSeccionResponse,
                CreateFormularioSeccionRequest,
                UpdateFormularioSeccionRequest>(
                "FormularioSeccion",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
