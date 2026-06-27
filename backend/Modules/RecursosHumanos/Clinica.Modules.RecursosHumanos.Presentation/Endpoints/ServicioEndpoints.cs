using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Servicios;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class ServicioEndpoints
{
    public static RouteGroupBuilder MapServicioEndpoints(this RouteGroupBuilder group)
    {
        var servicios = group.MapGroup("/servicios")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Servicios);

        servicios.MapGet("/", async (
                [AsParameters] ServicioPagedRequest request,
                IServicioService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Servicio_GetPaged")
            .Produces<ApiResponse<PagedResult<ServicioResponse>>>(StatusCodes.Status200OK);

        servicios.MapGet("/{id:guid}", async (
                Guid id,
                IServicioService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Servicio_GetById")
            .Produces<ApiResponse<ServicioResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        servicios.MapPost("/", async (
                CreateServicioRequest request,
                IValidator<CreateServicioRequest> validator,
                IServicioService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors
                            .Select(x => x.ErrorMessage)
                            .Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.CreateAsync(request, cancellationToken);

                return ApiResults.Created(result, "Registro creado correctamente.");
            })
            .WithName("Servicio_Create")
            .Produces<ApiResponse<ServicioResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        servicios.MapPut("/{id:guid}", async (
                Guid id,
                UpdateServicioRequest request,
                IValidator<UpdateServicioRequest> validator,
                IServicioService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors
                            .Select(x => x.ErrorMessage)
                            .Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.UpdateAsync(id, request, cancellationToken);

                return ApiResults.Ok(result, "Registro actualizado correctamente.");
            })
            .WithName("Servicio_Update")
            .Produces<ApiResponse<ServicioResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        servicios.MapDelete("/{id:guid}", async (
                Guid id,
                IServicioService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("Servicio_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
