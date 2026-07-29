using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class ProgramacionDiariaEndpoints
{
    public static RouteGroupBuilder MapProgramacionDiariaEndpoints(this RouteGroupBuilder group)
    {
        var programacion = group.MapGroup("/programacion-diaria")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.ProgramacionDiaria);

        programacion.MapGet("/", async (
                [AsParameters] ProgramacionDiariaPagedRequest request,
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("ProgramacionDiaria_GetPaged");

        programacion.MapGet("/disponibilidad", async (
                [AsParameters] MedicoDisponibilidadRequest request,
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetDisponibilidadAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("ProgramacionDiaria_GetDisponibilidad");

        programacion.MapGet("/programaciones-lookup", async (
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetProgramacionesLookupAsync(cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("ProgramacionDiaria_GetProgramacionesLookup");

        programacion.MapGet("/{id:guid}", async (
                Guid id,
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Programación no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("ProgramacionDiaria_GetById");

        programacion.MapPost("/", async (
                CreateProgramacionDiariaRequest request,
                IValidator<CreateProgramacionDiariaRequest> validator,
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.CreateAsync(request, cancellationToken);
                return ApiResults.Created(result, "Programación creada correctamente.");
            })
            .WithName("ProgramacionDiaria_Create");

        programacion.MapPut("/{id:guid}", async (
                Guid id,
                UpdateProgramacionDiariaRequest request,
                IValidator<UpdateProgramacionDiariaRequest> validator,
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Programación actualizada correctamente.");
            })
            .WithName("ProgramacionDiaria_Update");

        programacion.MapDelete("/{id:guid}", async (
                Guid id,
                IProgramacionDiariaService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("ProgramacionDiaria_Delete");

        return group;
    }
}
