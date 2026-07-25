using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.TiposExamen;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class TipoExamenEndpoints
{
    public static RouteGroupBuilder MapTipoExamenEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/tipos-examen")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.TiposExamen)
            .MapCrud<
                ITipoExamenService,
                Guid,
                TipoExamenResponse,
                CreateTipoExamenRequest,
                UpdateTipoExamenRequest>("LaboratorioTipoExamen");

        return group;
    }
}
