using Clinica.Modules.Compras.Application.Abstractions;
using Clinica.Modules.Compras.Application.OrdenesCompra;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Compras.Presentation.Endpoints;

public static class OrdenCompraEndpoints
{
    public static RouteGroupBuilder MapOrdenCompraEndpoints(this RouteGroupBuilder group)
    {
        var ordenes = group.MapGroup("/ordenes")
            .RequireAuthorization()
            .WithTags(ComprasSwaggerTags.Ordenes);

        ordenes.MapGet("/", async (
                [AsParameters] OrdenCompraPagedRequest request,
                IOrdenCompraService service,
                CancellationToken ct) =>
            ApiResults.Ok(await service.GetPagedAsync(request, ct)))
            .WithName("ComprasOrden_GetPaged");

        ordenes.MapGet("/{id:guid}", async (Guid id, IOrdenCompraService service, CancellationToken ct) =>
        {
            var result = await service.GetByIdAsync(id, ct);
            return result is null ? ApiResults.NotFound("Orden no encontrada.") : ApiResults.Ok(result);
        }).WithName("ComprasOrden_GetById");

        ordenes.MapPost("/", async (
                CreateOrdenCompraRequest request,
                IValidator<CreateOrdenCompraRequest> validator,
                IOrdenCompraService service,
                CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
            return ApiResults.Created(await service.CreateAsync(request, ct));
        }).WithName("ComprasOrden_Create");

        ordenes.MapPost("/{id:guid}/confirmar", async (Guid id, IOrdenCompraService service, CancellationToken ct) =>
            ApiResults.Ok(await service.ConfirmarAsync(id, ct), "Orden confirmada."))
            .WithName("ComprasOrden_Confirmar");

        ordenes.MapPost("/{id:guid}/recibir", async (
                Guid id,
                RecibirOrdenRequest request,
                IValidator<RecibirOrdenRequest> validator,
                IOrdenCompraService service,
                CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
            return ApiResults.Ok(await service.RecibirAsync(id, request, ct), "Recepción registrada.");
        }).WithName("ComprasOrden_Recibir");

        ordenes.MapPost("/{id:guid}/anular", async (Guid id, IOrdenCompraService service, CancellationToken ct) =>
        {
            await service.AnularAsync(id, ct);
            return ApiResults.Ok("Orden anulada.");
        }).WithName("ComprasOrden_Anular");

        return ordenes;
    }
}
