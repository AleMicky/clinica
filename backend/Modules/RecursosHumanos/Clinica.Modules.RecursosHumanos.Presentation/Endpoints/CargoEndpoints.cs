using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Cargos;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class CargoEndpoints
{
    public static RouteGroupBuilder MapCargoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/cargos")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Cargos)
            .MapCrud<
                ICargoService,
                Guid,
                CargoResponse,
                CreateCargoRequest,
                UpdateCargoRequest>("Cargo");

        return group;
    }
}
