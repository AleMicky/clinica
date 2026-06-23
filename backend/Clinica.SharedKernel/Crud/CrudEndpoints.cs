using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.SharedKernel.Crud;

public static class CrudEndpoints
{
    public static RouteGroupBuilder MapCrud<TService, TResponse, TCreateRequest, TUpdateRequest>(
        this RouteGroupBuilder group,
        string name)
        where TService : ICrudService<Guid, TResponse, TCreateRequest, TUpdateRequest>
    {
        group.MapGet("/", async (
                    [AsParameters] PagedRequest request,
                    TService service,
                    CancellationToken cancellationToken) =>
                ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName($"{name}_GetPaged")
            .Produces<ApiResponse<PagedResult<TResponse>>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", async (
                    Guid id,
                    TService service,
                    CancellationToken cancellationToken) =>
                ApiResults.Ok(await service.GetByIdAsync(id, cancellationToken)))
            .WithName($"{name}_GetById")
            .Produces<ApiResponse<TResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        group.MapPost("/", async (
                TCreateRequest request,
                IValidator<TCreateRequest> validator,
                TService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                    return ApiResults.BadRequest(GetValidationErrors(validation));

                var result = await service.CreateAsync(request, cancellationToken);

                return ApiResults.Created(result, "Registro creado correctamente.");
            })
            .WithName($"{name}_Create")
            .Produces<ApiResponse<TResponse>>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", async (
                Guid id,
                TUpdateRequest request,
                IValidator<TUpdateRequest> validator,
                TService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                    return ApiResults.BadRequest(GetValidationErrors(validation));

                var result = await service.UpdateAsync(id, request, cancellationToken);

                return ApiResults.Ok(result, "Registro actualizado correctamente.");
            })
            .WithName($"{name}_Update")
            .Produces<ApiResponse<TResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

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
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        return group;
    }

    private static string GetValidationErrors(FluentValidation.Results.ValidationResult validation)
    {
        return string.Join(", ",
            validation.Errors
                .Select(x => x.ErrorMessage)
                .Distinct());
    }
}