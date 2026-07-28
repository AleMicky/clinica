using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Periodos;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation.Endpoints;

public static class PeriodoEndpoints
{
    public static RouteGroupBuilder MapPeriodoEndpoints(
        this RouteGroupBuilder group)
    {
        var periodos = group.MapGroup("/periodos")
            .RequireAuthorization()
            .WithTags(ParametrosSwaggerTags.Periodos);

        periodos.MapGet("/", async (
                [AsParameters] PeriodoPagedRequest request,
                IPeriodoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Periodos_GetPaged")
            .Produces<ApiResponse<PagedResult<PeriodoResponse>>>(StatusCodes.Status200OK);

        periodos.MapGet("/{id:guid}", async (
                Guid id,
                IPeriodoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Periodos_GetById")
            .Produces<ApiResponse<PeriodoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        periodos.MapPut("/{id:guid}", async (
                Guid id,
                UpdatePeriodoRequest request,
                IValidator<UpdatePeriodoRequest> validator,
                IPeriodoService service,
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
            .WithName("Periodos_Update")
            .Produces<ApiResponse<PeriodoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
