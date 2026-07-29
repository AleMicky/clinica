using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Programacion;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class ProgramacionEndpoints
{
    public static RouteGroupBuilder MapProgramacionEndpoints(this RouteGroupBuilder group)
    {
        var programaciones = group.MapGroup("/programaciones")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Programaciones);

        programaciones.MapGet("/", async (
                [AsParameters] ProgramacionPagedRequest request,
                IProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Programacion_GetPaged");

        programaciones.MapGet("/{id:guid}", async (
                Guid id,
                IProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Programación no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("Programacion_GetById");

        programaciones.MapPost("/", async (
                CreateProgramacionRequest request,
                IValidator<CreateProgramacionRequest> validator,
                IProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.CreateAsync(request, cancellationToken);
                return ApiResults.Created(result, "Programación creada correctamente.");
            })
            .WithName("Programacion_Create");

        programaciones.MapPut("/{id:guid}", async (
                Guid id,
                UpdateProgramacionRequest request,
                IValidator<UpdateProgramacionRequest> validator,
                IProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Programación actualizada correctamente.");
            })
            .WithName("Programacion_Update");

        programaciones.MapPut("/{id:guid}/estado", async (
                Guid id,
                UpdateProgramacionEstadoRequest request,
                IValidator<UpdateProgramacionEstadoRequest> validator,
                IProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.UpdateEstadoAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Estado de programación actualizado correctamente.");
            })
            .WithName("Programacion_UpdateEstado");

        programaciones.MapDelete("/{id:guid}", async (
                Guid id,
                IProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("Programacion_Delete");

        return group;
    }
}
