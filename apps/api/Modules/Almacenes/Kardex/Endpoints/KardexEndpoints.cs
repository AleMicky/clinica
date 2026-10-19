using Clinica.Api.Modules.Almacenes.Kardex.Services;

namespace Clinica.Api.Modules.Almacenes.Kardex.Endpoints;

public static class KardexEndpoints
{
    public static IEndpointRouteBuilder MapKardexEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/kardex")
            .WithTags("Kardex")
            .RequireAuthorization();

        group.MapGet("/", ObtenerKardexAsync)
            .WithName("ObtenerKardex");

        return app;
    }

    private static async Task<IResult> ObtenerKardexAsync(
        int productoId,
        int? almacenId,
        DateTime? fechaDesde,
        DateTime? fechaHasta,
        IKardexService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerKardexAsync(
                productoId,
                almacenId,
                fechaDesde,
                fechaHasta,
                cancellationToken));
    }
}
