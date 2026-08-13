using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;

namespace Clinica.Api.Modules.Parametros.Correlativo.Endpoints;

public static class CorrelativoEndpoints
{
    public static IEndpointRouteBuilder MapCorrelativoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/correlativos")
            .WithTags("Correlativos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarCorrelativos");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerCorrelativo");
        group.MapPost("/generar", GenerarAsync).WithName("GenerarCorrelativo");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        string? codigo,
        int? gestion,
        CorrelativoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                codigo,
                gestion,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        CorrelativoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> GenerarAsync(
        GenerarCorrelativoRequest request,
        CorrelativoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.GenerarAsync(
                request,
                cancellationToken));
    }
}