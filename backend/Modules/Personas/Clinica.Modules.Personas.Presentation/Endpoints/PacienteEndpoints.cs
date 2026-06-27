using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Pacientes;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Personas.Presentation.Endpoints;

public static class PacienteEndpoints
{
    public static RouteGroupBuilder MapPacienteEndpoints(this RouteGroupBuilder group)
    {
        var pacientes = group.MapGroup("/pacientes")
            .RequireAuthorization()
            .WithTags(PersonasSwaggerTags.Pacientes);

        pacientes.MapGet("/", async (
                [AsParameters] PacientePagedRequest request,
                IPacienteService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Paciente_GetPaged")
            .Produces<ApiResponse<PagedResult<PacienteResponse>>>(StatusCodes.Status200OK);

        pacientes.MapGet("/{id:guid}", async (
                Guid id,
                IPacienteService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Paciente_GetById")
            .Produces<ApiResponse<PacienteResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        pacientes.MapPost("/", async (
                CreatePacienteRequest request,
                IValidator<CreatePacienteRequest> validator,
                IPacienteService service,
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
            .WithName("Paciente_Create")
            .Produces<ApiResponse<PacienteResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        pacientes.MapPut("/{id:guid}", async (
                Guid id,
                UpdatePacienteRequest request,
                IValidator<UpdatePacienteRequest> validator,
                IPacienteService service,
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
            .WithName("Paciente_Update")
            .Produces<ApiResponse<PacienteResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        pacientes.MapDelete("/{id:guid}", async (
                Guid id,
                IPacienteService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("Paciente_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
