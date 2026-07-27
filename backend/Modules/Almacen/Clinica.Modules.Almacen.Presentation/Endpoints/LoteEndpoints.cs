using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Lotes;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class LoteEndpoints
{
    public static RouteGroupBuilder MapLoteEndpoints(this RouteGroupBuilder group)
    {
        var lotes = group.MapGroup("/lotes")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Lotes);

        lotes.MapGet("/", async (
                [AsParameters] LotePagedRequest request,
                ILoteConsultaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("AlmacenLote_GetPaged");

        lotes.MapGet("/{id:guid}", async (
                Guid id,
                ILoteConsultaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Lote no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("AlmacenLote_GetById");

        return lotes;
    }
}
