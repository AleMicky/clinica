using Clinica.Api.Modules.Compras.CotizacionCompra.Dtos;
using Clinica.Api.Modules.Compras.CotizacionCompra.Enums;
using Clinica.Api.Modules.Compras.CotizacionCompra.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Endpoints;

public static class CotizacionCompraEndpoints
{
    public static IEndpointRouteBuilder MapCotizacionCompraEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/cotizaciones-compra")
            .WithTags("Cotizaciones de Compra")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarCotizacionesCompra");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerCotizacionCompra");

        group.MapPost("/", CrearAsync)
            .WithName("CrearCotizacionCompra")
            .Validate<CreateCotizacionCompraRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCotizacionCompra")
            .Validate<UpdateCotizacionCompraRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarCotizacionCompra");

        group.MapPost("/{id:int}/recibir", RecibirAsync)
            .WithName("RecibirCotizacionCompra");

        group.MapPost("/{id:int}/seleccionar", SeleccionarAsync)
            .WithName("SeleccionarCotizacionCompra");

        group.MapPost("/{id:int}/rechazar", RechazarAsync)
            .WithName("RechazarCotizacionCompra");

        group.MapPost("/{id:int}/cancelar", CancelarAsync)
            .WithName("CancelarCotizacionCompra")
            .Validate<CancelarCotizacionCompraRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? proveedorId,
        int? solicitudCompraId,
        EstadoCotizacionCompra? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                proveedorId,
                solicitudCompraId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCotizacionCompraRequest request,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/cotizaciones-compra/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCotizacionCompraRequest request,
        ICotizacionCompraService service,
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
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> RecibirAsync(
        int id,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RecibirAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> SeleccionarAsync(
        int id,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.SeleccionarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> RechazarAsync(
        int id,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RechazarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CancelarAsync(
        int id,
        CancelarCotizacionCompraRequest request,
        ICotizacionCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CancelarAsync(
                id,
                request,
                cancellationToken));
    }
}
