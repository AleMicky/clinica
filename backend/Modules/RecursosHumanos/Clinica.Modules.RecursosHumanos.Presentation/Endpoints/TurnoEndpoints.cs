using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Turnos;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class TurnoEndpoints
{
    public static RouteGroupBuilder MapTurnoEndpoints(this RouteGroupBuilder group)
    {
        var turnos = group.MapGroup("/turnos")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Turnos);

        turnos.MapGet("/", async (
                [AsParameters] TurnoPagedRequest request,
                ITurnoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Turno_GetPaged")
            .Produces<ApiResponse<PagedResult<TurnoResponse>>>(StatusCodes.Status200OK);

        turnos.MapGet("/{id:guid}", async (
                Guid id,
                ITurnoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Turno no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Turno_GetById");

        turnos.MapPost("/", async (
                CreateTurnoRequest request,
                IValidator<CreateTurnoRequest> validator,
                ITurnoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.CreateAsync(request, cancellationToken);
                return ApiResults.Created(result, "Turno creado correctamente.");
            })
            .WithName("Turno_Create");

        turnos.MapPut("/{id:guid}", async (
                Guid id,
                UpdateTurnoRequest request,
                IValidator<UpdateTurnoRequest> validator,
                ITurnoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Turno actualizado correctamente.");
            })
            .WithName("Turno_Update");

        turnos.MapDelete("/{id:guid}", async (
                Guid id,
                ITurnoService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("Turno_Delete");

        return group;
    }
}
