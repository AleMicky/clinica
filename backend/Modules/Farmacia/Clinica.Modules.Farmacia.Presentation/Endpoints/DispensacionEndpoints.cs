using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Dispensaciones;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Farmacia.Presentation.Endpoints;

public static class DispensacionEndpoints
{
    public static RouteGroupBuilder MapDispensacionEndpoints(this RouteGroupBuilder group)
    {
        var items = group.MapGroup("/dispensaciones")
            .RequireAuthorization()
            .WithTags(FarmaciaSwaggerTags.Dispensaciones);

        items.MapGet("/", async ([AsParameters] DispensacionPagedRequest request, IDispensacionService service, CancellationToken ct) =>
            ApiResults.Ok(await service.GetPagedAsync(request, ct)))
            .WithName("FarmaciaDispensacion_GetPaged");

        items.MapGet("/{id:guid}", async (Guid id, IDispensacionService service, CancellationToken ct) =>
        {
            var result = await service.GetByIdAsync(id, ct);
            return result is null ? ApiResults.NotFound("Dispensación no encontrada.") : ApiResults.Ok(result);
        }).WithName("FarmaciaDispensacion_GetById");

        items.MapPost("/", async (
                CreateDispensacionRequest request,
                IValidator<CreateDispensacionRequest> validator,
                IDispensacionService service,
                CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
            return ApiResults.Created(await service.CreateAsync(request, ct));
        }).WithName("FarmaciaDispensacion_Create");

        items.MapPost("/{id:guid}/confirmar", async (
                Guid id,
                ConfirmarDispensacionRequest? request,
                IDispensacionService service,
                CancellationToken ct) =>
            ApiResults.Ok(await service.ConfirmarAsync(id, request, ct), "Dispensación confirmada y enviada a caja."))
            .WithName("FarmaciaDispensacion_Confirmar");

        items.MapPost("/{id:guid}/anular", async (Guid id, IDispensacionService service, CancellationToken ct) =>
        {
            await service.AnularAsync(id, ct);
            return ApiResults.Ok("Dispensación anulada.");
        }).WithName("FarmaciaDispensacion_Anular");

        return items;
    }
}
