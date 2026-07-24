using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation.Endpoints;

public static class CorrelativoEndpoints
{
    public static RouteGroupBuilder MapCorrelativoEndpoints(
        this RouteGroupBuilder group)
    {
        var correlativos = group.MapGroup("/correlativos")
            .RequireAuthorization()
            .WithTags(ParametrosSwaggerTags.Correlativos);

        correlativos.MapGet("/", async (
                [AsParameters] CorrelativoPagedRequest request,
                ICorrelativoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Correlativo_GetPaged")
            .WithSummary("Listar correlativos")
            .Produces<ApiResponse<PagedResult<CorrelativoResponse>>>(StatusCodes.Status200OK);

        correlativos.MapPost("/generar", async (
                GenerarCorrelativoRequest request,
                IValidator<GenerarCorrelativoRequest> validator,
                ICorrelativoService service,
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

                var result = await service.GenerarAsync(request, cancellationToken);

                return ApiResults.Ok(result, "Correlativo generado correctamente.");
            })
            .WithName("Correlativo_Generar")
            .WithSummary("Generar el siguiente correlativo")
            .Produces<ApiResponse<CorrelativoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        return group;
    }
}
