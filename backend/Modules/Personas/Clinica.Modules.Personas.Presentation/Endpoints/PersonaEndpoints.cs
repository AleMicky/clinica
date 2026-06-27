using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Personas;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Personas.Presentation.Endpoints;

public static class PersonaEndpoints
{
    public static RouteGroupBuilder MapPersonaEndpoints(
        this RouteGroupBuilder group)
    {
        var personas = group.MapGroup("")
            .RequireAuthorization()
            .WithTags(PersonasSwaggerTags.Personas);

        personas.MapGet("/", async (
                [AsParameters] PersonaPagedRequest request,
                IPersonaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Persona_GetPaged")
            .Produces<ApiResponse<PagedResult<PersonaResponse>>>(StatusCodes.Status200OK);

        personas.MapGet("/{id:guid}", async (
                Guid id,
                IPersonaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Persona_GetById")
            .Produces<ApiResponse<PersonaResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        personas.MapPost("/", async (
                CreatePersonaRequest request,
                IValidator<CreatePersonaRequest> validator,
                IPersonaService service,
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
            .WithName("Persona_Create")
            .Produces<ApiResponse<PersonaResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        personas.MapPut("/{id:guid}", async (
                Guid id,
                UpdatePersonaRequest request,
                IValidator<UpdatePersonaRequest> validator,
                IPersonaService service,
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
            .WithName("Persona_Update")
            .Produces<ApiResponse<PersonaResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        personas.MapDelete("/{id:guid}", async (
                Guid id,
                IPersonaService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("Persona_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
