using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Precios;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Farmacia.Presentation.Endpoints;

public static class PrecioEndpoints
{
    public static RouteGroupBuilder MapPrecioEndpoints(this RouteGroupBuilder group)
    {
        var precios = group.MapGroup("/precios")
            .RequireAuthorization()
            .WithTags(FarmaciaSwaggerTags.Precios);

        precios.MapGet("/", async ([AsParameters] PrecioPagedRequest request, IPrecioService service, CancellationToken ct) =>
            ApiResults.Ok(await service.GetPagedAsync(request, ct)))
            .WithName("FarmaciaPrecio_GetPaged");

        precios.MapGet("/{id:guid}", async (Guid id, IPrecioService service, CancellationToken ct) =>
        {
            var result = await service.GetByIdAsync(id, ct);
            return result is null ? ApiResults.NotFound("Precio no encontrado.") : ApiResults.Ok(result);
        }).WithName("FarmaciaPrecio_GetById");

        precios.MapGet("/vigente/{productoId:guid}", async (Guid productoId, IPrecioService service, CancellationToken ct) =>
        {
            var result = await service.GetVigenteAsync(productoId, null, ct);
            return result is null ? ApiResults.NotFound("No hay precio vigente.") : ApiResults.Ok(result);
        }).WithName("FarmaciaPrecio_Vigente");

        precios.MapPost("/", async (
                CreatePrecioRequest request,
                IValidator<CreatePrecioRequest> validator,
                IPrecioService service,
                CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
            return ApiResults.Created(await service.CreateAsync(request, ct));
        }).WithName("FarmaciaPrecio_Create");

        precios.MapPut("/{id:guid}", async (
                Guid id,
                UpdatePrecioRequest request,
                IValidator<UpdatePrecioRequest> validator,
                IPrecioService service,
                CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
            return ApiResults.Ok(await service.UpdateAsync(id, request, ct));
        }).WithName("FarmaciaPrecio_Update");

        precios.MapDelete("/{id:guid}", async (Guid id, IPrecioService service, CancellationToken ct) =>
        {
            await service.DeleteAsync(id, ct);
            return ApiResults.Ok("Precio eliminado.");
        }).WithName("FarmaciaPrecio_Delete");

        return precios;
    }
}
