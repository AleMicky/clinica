using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.ContactosEmergencia;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Personas.Presentation.Endpoints;

public static class ContactoEmergenciaEndpoints
{
    public static RouteGroupBuilder MapContactoEmergenciaEndpoints(this RouteGroupBuilder group)
    {
        var contactos = group.MapGroup("/contactos-emergencia")
            .RequireAuthorization()
            .WithTags(PersonasSwaggerTags.ContactosEmergencia);

        contactos.MapGet("/", async (
                [AsParameters] ContactoEmergenciaPagedRequest request,
                IContactoEmergenciaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("ContactoEmergencia_GetPaged")
            .Produces<ApiResponse<PagedResult<ContactoEmergenciaResponse>>>(StatusCodes.Status200OK);

        contactos.MapGet("/{id:guid}", async (
                Guid id,
                IContactoEmergenciaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("ContactoEmergencia_GetById")
            .Produces<ApiResponse<ContactoEmergenciaResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        contactos.MapPost("/", async (
                CreateContactoEmergenciaRequest request,
                IValidator<CreateContactoEmergenciaRequest> validator,
                IContactoEmergenciaService service,
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
            .WithName("ContactoEmergencia_Create")
            .Produces<ApiResponse<ContactoEmergenciaResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        contactos.MapPut("/{id:guid}", async (
                Guid id,
                UpdateContactoEmergenciaRequest request,
                IValidator<UpdateContactoEmergenciaRequest> validator,
                IContactoEmergenciaService service,
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
            .WithName("ContactoEmergencia_Update")
            .Produces<ApiResponse<ContactoEmergenciaResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        contactos.MapDelete("/{id:guid}", async (
                Guid id,
                IContactoEmergenciaService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("ContactoEmergencia_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
