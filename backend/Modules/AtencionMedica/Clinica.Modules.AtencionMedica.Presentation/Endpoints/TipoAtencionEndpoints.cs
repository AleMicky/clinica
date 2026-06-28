using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.TiposAtencion;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class TipoAtencionEndpoints
{
    public static RouteGroupBuilder MapTipoAtencionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/tipos-atencion")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.TiposAtencion)
            .MapCrud<
                ITipoAtencionService,
                Guid,
                TipoAtencionResponse,
                CreateTipoAtencionRequest,
                UpdateTipoAtencionRequest>("TipoAtencion");

        return group;
    }
}
