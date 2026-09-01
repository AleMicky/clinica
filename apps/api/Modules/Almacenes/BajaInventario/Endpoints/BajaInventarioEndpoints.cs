using Clinica.Api.Modules.Almacenes.BajaInventario.Dtos;
using Clinica.Api.Modules.Almacenes.BajaInventario.Enums;
using Clinica.Api.Modules.Almacenes.BajaInventario.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Endpoints;

public static class BajaInventarioEndpoints
{
    public static IEndpointRouteBuilder MapBajaInventarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/bajas-inventario")
            .WithTags("Bajas de Inventario")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarBajasInventario");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerBajaInventario");

        group.MapPost("/", CrearAsync)
            .WithName("CrearBajaInventario")
            .Validate<CreateBajaInventarioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarBajaInventario")
            .Validate<UpdateBajaInventarioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarBajaInventario");

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarBajaInventario");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularBajaInventario")
            .Validate<AnularBajaInventarioRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        TipoBajaInventario? tipo,
        EstadoBajaInventario? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IBajaInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                tipo,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IBajaInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateBajaInventarioRequest request,
        IBajaInventarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/bajas-inventario/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateBajaInventarioRequest request,
        IBajaInventarioService service,
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
        IBajaInventarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ConfirmarAsync(
        int id,
        IBajaInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConfirmarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularBajaInventarioRequest request,
        IBajaInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request,
                cancellationToken));
    }
}