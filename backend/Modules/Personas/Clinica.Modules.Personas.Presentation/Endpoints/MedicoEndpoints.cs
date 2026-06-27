using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Medicos;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Personas.Presentation.Endpoints;

public static class MedicoEndpoints
{
    public static RouteGroupBuilder MapMedicoEndpoints(this RouteGroupBuilder group)
    {
        var medicos = group.MapGroup("/medicos")
            .RequireAuthorization()
            .WithTags(PersonasSwaggerTags.Medicos);

        medicos.MapGet("/", async (
                [AsParameters] MedicoPagedRequest request,
                IMedicoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Medico_GetPaged")
            .Produces<ApiResponse<PagedResult<MedicoResponse>>>(StatusCodes.Status200OK);

        medicos.MapGet("/{id:guid}", async (
                Guid id,
                IMedicoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Medico_GetById")
            .Produces<ApiResponse<MedicoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        medicos.MapPost("/", async (
                CreateMedicoRequest request,
                IValidator<CreateMedicoRequest> validator,
                IMedicoService service,
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
            .WithName("Medico_Create")
            .Produces<ApiResponse<MedicoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        medicos.MapPut("/{id:guid}", async (
                Guid id,
                UpdateMedicoRequest request,
                IValidator<UpdateMedicoRequest> validator,
                IMedicoService service,
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
            .WithName("Medico_Update")
            .Produces<ApiResponse<MedicoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        medicos.MapDelete("/{id:guid}", async (
                Guid id,
                IMedicoService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("Medico_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
