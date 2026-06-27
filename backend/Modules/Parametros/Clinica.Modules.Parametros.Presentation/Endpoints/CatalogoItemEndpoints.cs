using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoItems;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation.Endpoints;

public static class CatalogoItemEndpoints
{
    public static RouteGroupBuilder MapCatalogoItemEndpoints(
        this RouteGroupBuilder group)
    {
        var catalogoItems = group.MapGroup("/catalogo-items")
            .RequireAuthorization();

        catalogoItems.MapGet("/", async (
                [AsParameters] CatalogoItemPagedRequest request,
                ICatalogoItemService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("CatalogoItem_GetPaged")
            .Produces<ApiResponse<PagedResult<CatalogoItemResponse>>>(StatusCodes.Status200OK);

        catalogoItems.MapGet("/{id:guid}", async (
                Guid id,
                ICatalogoItemService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("CatalogoItem_GetById")
            .Produces<ApiResponse<CatalogoItemResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        catalogoItems.MapPost("/", async (
                CreateCatalogoItemRequest request,
                IValidator<CreateCatalogoItemRequest> validator,
                ICatalogoItemService service,
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
            .WithName("CatalogoItem_Create")
            .Produces<ApiResponse<CatalogoItemResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        catalogoItems.MapPut("/{id:guid}", async (
                Guid id,
                UpdateCatalogoItemRequest request,
                IValidator<UpdateCatalogoItemRequest> validator,
                ICatalogoItemService service,
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
            .WithName("CatalogoItem_Update")
            .Produces<ApiResponse<CatalogoItemResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        catalogoItems.MapDelete("/{id:guid}", async (
                Guid id,
                ICatalogoItemService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("CatalogoItem_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
