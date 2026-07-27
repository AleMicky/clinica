using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Existencias;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class ExistenciaEndpoints
{
    public static RouteGroupBuilder MapExistenciaEndpoints(this RouteGroupBuilder group)
    {
        var existencias = group.MapGroup("/existencias")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Existencias);

        existencias.MapGet("/", async (
                [AsParameters] ExistenciaPagedRequest request,
                IExistenciaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("AlmacenExistencia_GetPaged");

        existencias.MapGet("/disponibilidad/{productoId:guid}", async (
                Guid productoId,
                IAlmacenStockService stockService,
                CancellationToken cancellationToken) =>
            {
                var result = await stockService.ConsultarDisponibilidadAsync(productoId, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("AlmacenExistencia_Disponibilidad");

        return existencias;
    }
}
