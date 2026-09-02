using Clinica.Api.Modules.Compras.RecepcionCompra.Dtos;
using Clinica.Api.Modules.Compras.RecepcionCompra.Enums;
using Clinica.Api.Modules.Compras.RecepcionCompra.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Endpoints;

public static class RecepcionCompraEndpoints
{
    public static IEndpointRouteBuilder MapRecepcionCompraEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/recepciones-compra")
            .WithTags("Recepción de Compra")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarRecepcionesCompra");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerRecepcionCompra");

        group.MapPost("/", CrearAsync)
            .WithName("CrearRecepcionCompra")
            .Validate<CreateRecepcionCompraRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarRecepcionCompra")
            .Validate<UpdateRecepcionCompraRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarRecepcionCompra");

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarRecepcionCompra");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularRecepcionCompra")
            .Validate<AnularRecepcionCompraRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? ordenCompraId,
        int? proveedorId,
        int? almacenId,
        EstadoRecepcionCompra? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IRecepcionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                ordenCompraId,
                proveedorId,
                almacenId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IRecepcionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateRecepcionCompraRequest request,
        IRecepcionCompraService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/recepciones-compra/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateRecepcionCompraRequest request,
        IRecepcionCompraService service,
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
        IRecepcionCompraService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ConfirmarAsync(
        int id,
        IRecepcionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConfirmarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularRecepcionCompraRequest request,
        IRecepcionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request,
                cancellationToken));
    }
}
