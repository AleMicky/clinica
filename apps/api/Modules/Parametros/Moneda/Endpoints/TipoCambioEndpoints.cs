using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Parametros.Moneda.Endpoints;

public static class TipoCambioEndpoints
{
    public static IEndpointRouteBuilder MapTipoCambioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/tipos-cambio")
            .WithTags("Tipos de Cambio")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarTiposCambio");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerTipoCambio");
        group.MapPost("/", CrearAsync).WithName("CrearTipoCambio");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarTipoCambio");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarTipoCambio");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        TipoCambioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        TipoCambioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateTipoCambioRequest request,
        TipoCambioService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/tipos-cambio/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTipoCambioRequest request,
        TipoCambioService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        TipoCambioService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}