using Clinica.Api.Modules.Almacenes.ReservaStock.Dtos;
using Clinica.Api.Modules.Almacenes.ReservaStock.Enums;
using Clinica.Api.Modules.Almacenes.ReservaStock.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.ReservaStock.Endpoints;

public static class ReservaStockEndpoints
{
    public static IEndpointRouteBuilder MapReservaStockEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/reservas-stock")
            .WithTags("Reservas de Stock")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarReservasStock");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerReservaStock");

        group.MapPost("/", CrearAsync)
            .WithName("CrearReservaStock")
            .Validate<CreateReservaStockRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarReservaStock")
            .Validate<UpdateReservaStockRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarReservaStock");

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarReservaStock");

        group.MapPost("/{id:int}/liberar", LiberarAsync)
            .WithName("LiberarReservaStock");

        group.MapPost("/{id:int}/consumir", ConsumirAsync)
            .WithName("ConsumirReservaStock")
            .Validate<ConfirmarReservaStockRequest>();

        group.MapPost("/{id:int}/cancelar", CancelarAsync)
            .WithName("CancelarReservaStock")
            .Validate<CancelarReservaStockRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        EstadoReservaStock? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateReservaStockRequest request,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/reservas-stock/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateReservaStockRequest request,
        IReservaStockService service,
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
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ConfirmarAsync(
        int id,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConfirmarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> LiberarAsync(
        int id,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.LiberarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> ConsumirAsync(
        int id,
        ConfirmarReservaStockRequest request,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConsumirAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> CancelarAsync(
        int id,
        CancelarReservaStockRequest request,
        IReservaStockService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CancelarAsync(
                id,
                request,
                cancellationToken));
    }
}
