using Clinica.Api.Modules.Almacenes.AlertasStock.Enums;
using Clinica.Api.Modules.Almacenes.AlertasStock.Services;

namespace Clinica.Api.Modules.Almacenes.AlertasStock.Endpoints;

public static class AlertasStockEndpoints
{
    public static IEndpointRouteBuilder MapAlertasStockEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/alertas-stock")
            .WithTags("Alertas de Stock")
            .RequireAuthorization();

        group.MapGet("/", ObtenerAlertasAsync)
            .WithName("ObtenerAlertasStock");

        return app;
    }

    private static async Task<IResult> ObtenerAlertasAsync(
        int? almacenId,
        TipoAlertaStock? tipo,
        int? diasVencimiento,
        IAlertasStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAlertasAsync(
                almacenId,
                tipo,
                diasVencimiento ?? 30,
                cancellationToken));
    }
}
