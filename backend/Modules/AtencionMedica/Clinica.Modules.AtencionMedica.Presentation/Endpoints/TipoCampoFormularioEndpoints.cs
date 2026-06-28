using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class TipoCampoFormularioEndpoints
{
    public static RouteGroupBuilder MapTipoCampoFormularioEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/tipos-campo-formulario")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.TiposCampoFormulario)
            .MapCrud<
                ITipoCampoFormularioService,
                Guid,
                TipoCampoFormularioResponse,
                CreateTipoCampoFormularioRequest,
                UpdateTipoCampoFormularioRequest>("TipoCampoFormulario");

        return group;
    }
}
