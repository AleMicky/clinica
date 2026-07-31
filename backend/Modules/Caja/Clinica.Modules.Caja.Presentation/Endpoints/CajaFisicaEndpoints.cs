using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cajas;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Caja.Presentation.Endpoints;

public static class CajaFisicaEndpoints
{
    public static RouteGroupBuilder MapCajaFisicaEndpoints(this RouteGroupBuilder group)
    {
        var cajas = group.MapGroup("/cajas")
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Cajas);

        cajas.MapGet("/", async (
                [AsParameters] CajaPagedRequest request,
                ICajaFisicaService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("Caja_GetCajas");

        cajas.MapGet("/{id:guid}", async (
                Guid id,
                ICajaFisicaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Caja no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("Caja_GetCajaById");

        cajas.MapPost("/", async (
                CreateCajaRequest request,
                IValidator<CreateCajaRequest> validator,
                ICajaFisicaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.CreateAsync(request, cancellationToken);
                return ApiResults.Created(result, "Caja creada correctamente.");
            })
            .WithName("Caja_CreateCaja");

        cajas.MapPut("/{id:guid}", async (
                Guid id,
                UpdateCajaRequest request,
                IValidator<UpdateCajaRequest> validator,
                ICajaFisicaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Caja actualizada correctamente.");
            })
            .WithName("Caja_UpdateCaja");

        cajas.MapPatch("/{id:guid}/estado", async (
                Guid id,
                ChangeCajaStatusRequest request,
                ICajaFisicaService service,
                CancellationToken cancellationToken) =>
            {
                await service.ChangeStatusAsync(id, request, cancellationToken);
                return ApiResults.Ok("Estado de caja actualizado.");
            })
            .WithName("Caja_ChangeCajaStatus");

        cajas.MapDelete("/{id:guid}", async (
                Guid id,
                ICajaFisicaService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.Ok("Caja eliminada correctamente.");
            })
            .WithName("Caja_DeleteCaja");

        return group;
    }
}
