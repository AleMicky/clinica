using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

internal static class FilteredCrudEndpointExtensions
{
    public static RouteGroupBuilder MapFilteredCrud<TPagedRequest, TService, TResponse, TCreateRequest, TUpdateRequest>(
        this RouteGroupBuilder group,
        string name,
        Func<TService, TPagedRequest, CancellationToken, Task<PagedResult<TResponse>>> getPaged)
        where TPagedRequest : PagedRequest, new()
        where TService : ICrudService<Guid, TResponse, TCreateRequest, TUpdateRequest>
    {
        group.MapGet("/", async (
                [AsParameters] TPagedRequest request,
                TService service,
                CancellationToken cancellationToken) =>
            {
                var result = await getPaged(service, request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName($"{name}_GetPaged")
            .Produces<ApiResponse<PagedResult<TResponse>>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", async (
                Guid id,
                TService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName($"{name}_GetById")
            .Produces<ApiResponse<TResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        group.MapPost("/", async (
                TCreateRequest request,
                IValidator<TCreateRequest> validator,
                TService service,
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
            .WithName($"{name}_Create")
            .Produces<ApiResponse<TResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", async (
                Guid id,
                TUpdateRequest request,
                IValidator<TUpdateRequest> validator,
                TService service,
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
            .WithName($"{name}_Update")
            .Produces<ApiResponse<TResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", async (
                Guid id,
                TService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName($"{name}_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
