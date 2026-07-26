using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.PruebaPrecios;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class PruebaPrecioEndpoints
{
    public static RouteGroupBuilder MapPruebaPrecioEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/prueba-precios")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.PruebaPrecios)
            .MapFilteredCrud<
                PruebaPrecioPagedRequest,
                IPruebaPrecioService,
                PruebaPrecioResponse,
                CreatePruebaPrecioRequest,
                UpdatePruebaPrecioRequest>(
                "LaboratorioPruebaPrecio",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
