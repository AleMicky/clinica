using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Pruebas;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class PruebaEndpoints
{
    public static RouteGroupBuilder MapPruebaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/pruebas")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Pruebas)
            .MapCrud<
                IPruebaService,
                Guid,
                PruebaResponse,
                CreatePruebaRequest,
                UpdatePruebaRequest>("LaboratorioPrueba");

        return group;
    }
}
