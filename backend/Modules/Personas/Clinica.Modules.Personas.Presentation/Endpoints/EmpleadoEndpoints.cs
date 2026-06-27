using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Empleados;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Personas.Presentation.Endpoints;

public static class EmpleadoEndpoints
{
    public static RouteGroupBuilder MapEmpleadoEndpoints(this RouteGroupBuilder group)
    {
        var empleados = group.MapGroup("/empleados")
            .RequireAuthorization()
            .WithTags(PersonasSwaggerTags.Empleados);

        empleados.MapGet("/", async (
                [AsParameters] EmpleadoPagedRequest request,
                IEmpleadoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Empleado_GetPaged")
            .Produces<ApiResponse<PagedResult<EmpleadoResponse>>>(StatusCodes.Status200OK);

        empleados.MapGet("/{id:guid}", async (
                Guid id,
                IEmpleadoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Empleado_GetById")
            .Produces<ApiResponse<EmpleadoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        empleados.MapPost("/", async (
                CreateEmpleadoRequest request,
                IValidator<CreateEmpleadoRequest> validator,
                IEmpleadoService service,
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
            .WithName("Empleado_Create")
            .Produces<ApiResponse<EmpleadoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        empleados.MapPut("/{id:guid}", async (
                Guid id,
                UpdateEmpleadoRequest request,
                IValidator<UpdateEmpleadoRequest> validator,
                IEmpleadoService service,
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
            .WithName("Empleado_Update")
            .Produces<ApiResponse<EmpleadoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        empleados.MapDelete("/{id:guid}", async (
                Guid id,
                IEmpleadoService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("Empleado_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
