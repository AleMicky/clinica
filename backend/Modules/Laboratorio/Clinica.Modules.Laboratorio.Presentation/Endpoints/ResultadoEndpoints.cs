using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Resultados;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class ResultadoEndpoints
{
    public static RouteGroupBuilder MapResultadoEndpoints(this RouteGroupBuilder group)
    {
        var resultados = group.MapGroup("/resultados")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Resultados);

        resultados.MapGet("/", async (
                [AsParameters] ResultadoPagedRequest request,
                IResultadoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("LaboratorioResultado_GetPaged")
            .Produces<ApiResponse<PagedResult<ResultadoResponse>>>(StatusCodes.Status200OK);

        resultados.MapGet("/{id:guid}", async (
                Guid id,
                IResultadoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Resultado no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("LaboratorioResultado_GetById")
            .Produces<ApiResponse<ResultadoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        resultados.MapPost("/{id:guid}/validar", async (
                Guid id,
                ValidarResultadoRequest request,
                IValidator<ValidarResultadoRequest> validator,
                IResultadoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.ValidarAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Resultado validado correctamente.");
            })
            .WithName("LaboratorioResultado_Validar")
            .Produces<ApiResponse<ResultadoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        return group;
    }

    public static RouteGroupBuilder MapSolicitudResultadoEndpoints(this RouteGroupBuilder group)
    {
        var solicitudes = group.MapGroup("/solicitudes")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Resultados);

        solicitudes.MapPost("/{id:guid}/resultados", async (
                Guid id,
                RegistrarResultadosRequest request,
                IValidator<RegistrarResultadosRequest> validator,
                IResultadoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.RegistrarAsync(id, request, cancellationToken);
                return ApiResults.Created(result, "Resultados registrados correctamente.");
            })
            .WithName("LaboratorioSolicitud_RegistrarResultados")
            .Produces<ApiResponse<ResultadoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        return group;
    }
}
