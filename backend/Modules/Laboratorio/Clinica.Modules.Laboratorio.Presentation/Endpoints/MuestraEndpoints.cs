using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Muestras;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class MuestraEndpoints
{
    public static RouteGroupBuilder MapMuestraEndpoints(this RouteGroupBuilder group)
    {
        var muestras = group.MapGroup("/muestras")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Muestras);

        muestras.MapGet("/", async (
                [AsParameters] MuestraPagedRequest request,
                IMuestraService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("LaboratorioMuestra_GetPaged")
            .Produces<ApiResponse<PagedResult<MuestraResponse>>>(StatusCodes.Status200OK);

        muestras.MapGet("/{id:guid}", async (
                Guid id,
                IMuestraService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Muestra no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("LaboratorioMuestra_GetById")
            .Produces<ApiResponse<MuestraResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        // Nested under solicitudes path via separate mapping in LaboratorioEndpoints
        return group;
    }

    public static RouteGroupBuilder MapSolicitudMuestraEndpoints(this RouteGroupBuilder group)
    {
        var solicitudes = group.MapGroup("/solicitudes")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Muestras);

        solicitudes.MapPost("/{id:guid}/muestras", async (
                Guid id,
                TomarMuestraRequest request,
                IValidator<TomarMuestraRequest> validator,
                IMuestraService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.TomarMuestraAsync(id, request, cancellationToken);
                return ApiResults.Created(result, "Muestra registrada correctamente.");
            })
            .WithName("LaboratorioSolicitud_TomarMuestra")
            .Produces<ApiResponse<MuestraResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        return group;
    }
}
