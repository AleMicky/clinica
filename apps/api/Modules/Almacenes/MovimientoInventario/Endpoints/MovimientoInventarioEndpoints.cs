using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Endpoints;

public static class MovimientoInventarioEndpoints
{
    public static IEndpointRouteBuilder MapMovimientoInventarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/movimientos-inventario")
            .WithTags("Movimientos de Inventario")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarMovimientosInventario");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerMovimientoInventario");

        group.MapPost("/", CrearAsync)
            .WithName("CrearMovimientoInventario")
            .Validate<CreateMovimientoInventarioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarMovimientoInventario")
            .Validate<UpdateMovimientoInventarioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarMovimientoInventario");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? tipoMovimientoInventarioId,
        int? almacenId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                tipoMovimientoInventarioId,
                almacenId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMovimientoInventarioRequest request,
        IMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/movimientos-inventario/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateMovimientoInventarioRequest request,
        IMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        IMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
