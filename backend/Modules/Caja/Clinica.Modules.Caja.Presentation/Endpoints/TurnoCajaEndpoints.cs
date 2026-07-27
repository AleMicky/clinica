using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Arqueos;
using Clinica.Modules.Caja.Application.Turnos;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Caja.Presentation.Endpoints;

public static class TurnoCajaEndpoints
{
    public static RouteGroupBuilder MapTurnoCajaEndpoints(this RouteGroupBuilder group)
    {
        var turnos = group.MapGroup("/turnos")
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Turnos);

        turnos.MapGet("/", async (
                [AsParameters] TurnoCajaPagedRequest request,
                ITurnoCajaService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("Caja_GetTurnos");

        turnos.MapGet("/abierto", async (
                ITurnoCajaService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.ObtenerTurnoAbiertoAsync(cancellationToken)))
            .WithName("Caja_GetTurnoAbierto");

        turnos.MapGet("/{id:guid}", async (
                Guid id,
                ITurnoCajaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Turno no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Caja_GetTurnoById");

        turnos.MapPost("/abrir", async (
                AbrirTurnoCajaRequest request,
                IValidator<AbrirTurnoCajaRequest> validator,
                ITurnoCajaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.AbrirAsync(request, cancellationToken);
                return ApiResults.Created(result, "Turno abierto correctamente.");
            })
            .WithName("Caja_AbrirTurno");

        turnos.MapPost("/{id:guid}/cerrar", async (
                Guid id,
                CerrarTurnoCajaRequest request,
                IValidator<CerrarTurnoCajaRequest> validator,
                ITurnoCajaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.CerrarAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Turno cerrado correctamente.");
            })
            .WithName("Caja_CerrarTurno");

        turnos.MapGet("/{turnoId:guid}/resumen", async (
                Guid turnoId,
                IMovimientoCajaService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetResumenTurnoAsync(turnoId, cancellationToken)))
            .WithName("Caja_GetResumenTurno");

        turnos.MapGet("/{turnoId:guid}/arqueo", async (
                Guid turnoId,
                IArqueoCajaService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.CalcularAsync(turnoId, cancellationToken)))
            .WithName("Caja_GetArqueoTurno");

        turnos.MapPost("/{turnoId:guid}/arqueo", async (
                Guid turnoId,
                CerrarArqueoCajaRequest request,
                IValidator<CerrarArqueoCajaRequest> validator,
                IArqueoCajaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.CerrarTurnoAsync(turnoId, request, cancellationToken);
                return ApiResults.Ok(result, "Arqueo confirmado y turno cerrado.");
            })
            .WithName("Caja_CerrarArqueoTurno");

        return group;
    }
}
