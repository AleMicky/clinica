using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.FormularioCampos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class FormularioCampoEndpoints
{
    public static RouteGroupBuilder MapFormularioCampoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/formulario-campos")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.FormularioCampos)
            .MapFilteredCrud<
                FormularioCampoPagedRequest,
                IFormularioCampoService,
                FormularioCampoResponse,
                CreateFormularioCampoRequest,
                UpdateFormularioCampoRequest>(
                "FormularioCampo",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
