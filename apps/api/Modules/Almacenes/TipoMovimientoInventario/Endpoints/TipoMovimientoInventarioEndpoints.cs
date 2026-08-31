using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Endpoints;

public static class TipoMovimientoInventarioEndpoints
{
    public static IEndpointRouteBuilder MapTipoMovimientoInventarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/tipos-movimiento-inventario")
            .WithTags("Tipos de Movimiento de Inventario")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarTiposMovimientoInventario");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerTipoMovimientoInventario");

        group.MapPost("/", CrearAsync)
            .WithName("CrearTipoMovimientoInventario")
            .Validate<CreateTipoMovimientoInventarioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarTipoMovimientoInventario")
            .Validate<UpdateTipoMovimientoInventarioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarTipoMovimientoInventario");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        NaturalezaMovimiento? naturaleza,
        string? search,
        [AsParameters] PaginationRequest pagination,
        ITipoMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                naturaleza,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        ITipoMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateTipoMovimientoInventarioRequest request,
        ITipoMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/tipos-movimiento-inventario/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTipoMovimientoInventarioRequest request,
        ITipoMovimientoInventarioService service,
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
        ITipoMovimientoInventarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
