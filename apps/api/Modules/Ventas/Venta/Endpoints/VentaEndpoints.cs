using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Modules.Ventas.Venta.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Ventas.Venta.Endpoints;

public static class VentaEndpoints
{
    public static IEndpointRouteBuilder MapVentaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/ventas")
            .WithTags("Ventas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarVentas");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerVenta");

        group.MapPost("/", CrearAsync)
            .WithName("CrearVenta")
            .Validate<CreateVentaRequest>();

        group.MapPatch("/{id:int}/estado", CambiarEstadoAsync)
            .WithName("CambiarEstadoVenta")
            .Validate<CambiarEstadoVentaRequest>();

        group.MapDelete("/{id:int}", AnularAsync)
            .WithName("AnularVenta");

        MapDetalles(group);
        MapPagadores(group);

        return app;
    }

    private static void MapDetalles(RouteGroupBuilder group)
    {
        group.MapGet("/{ventaId:int}/detalles", ListarDetallesAsync)
            .WithName("ListarVentaDetalles");

        group.MapGet("/{ventaId:int}/detalles/{detalleId:int}", ObtenerDetalleAsync)
            .WithName("ObtenerVentaDetalle");

        group.MapPost("/{ventaId:int}/detalles", CrearDetalleAsync)
            .WithName("CrearVentaDetalle")
            .Validate<CreateVentaDetalleRequest>();

        group.MapPut("/{ventaId:int}/detalles/{detalleId:int}", ActualizarDetalleAsync)
            .WithName("ActualizarVentaDetalle")
            .Validate<UpdateVentaDetalleRequest>();

        group.MapDelete("/{ventaId:int}/detalles/{detalleId:int}", EliminarDetalleAsync)
            .WithName("EliminarVentaDetalle");
    }

    private static void MapPagadores(RouteGroupBuilder group)
    {
        group.MapGet("/{ventaId:int}/pagadores", ListarPagadoresAsync)
            .WithName("ListarVentaPagadores");

        group.MapGet("/{ventaId:int}/pagadores/{pagadorId:int}", ObtenerPagadorAsync)
            .WithName("ObtenerVentaPagador");

        group.MapPost("/{ventaId:int}/pagadores", CrearPagadorAsync)
            .WithName("CrearVentaPagador")
            .Validate<CreateVentaPagadorRequest>();

        group.MapPut("/{ventaId:int}/pagadores/{pagadorId:int}", ActualizarPagadorAsync)
            .WithName("ActualizarVentaPagador")
            .Validate<UpdateVentaPagadorRequest>();

        group.MapDelete("/{ventaId:int}/pagadores/{pagadorId:int}", EliminarPagadorAsync)
            .WithName("EliminarVentaPagador");
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EstadoVenta? estado,
        VentaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                estado,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        VentaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateVentaRequest request,
        VentaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/ventas/{result.Id}",
            result);
    }

    private static async Task<IResult> CambiarEstadoAsync(
        int id,
        CambiarEstadoVentaRequest request,
        VentaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CambiarEstadoAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        VentaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ListarDetallesAsync(
        int ventaId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        VentaDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                ventaId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerDetalleAsync(
        int ventaId,
        int detalleId,
        VentaDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                ventaId,
                detalleId,
                cancellationToken));
    }

    private static async Task<IResult> CrearDetalleAsync(
        int ventaId,
        CreateVentaDetalleRequest request,
        VentaDetalleService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            ventaId,
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/ventas/{ventaId}/detalles/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarDetalleAsync(
        int ventaId,
        int detalleId,
        UpdateVentaDetalleRequest request,
        VentaDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                ventaId,
                detalleId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarDetalleAsync(
        int ventaId,
        int detalleId,
        VentaDetalleService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            ventaId,
            detalleId,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ListarPagadoresAsync(
        int ventaId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        VentaPagadorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                ventaId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerPagadorAsync(
        int ventaId,
        int pagadorId,
        VentaPagadorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                ventaId,
                pagadorId,
                cancellationToken));
    }

    private static async Task<IResult> CrearPagadorAsync(
        int ventaId,
        CreateVentaPagadorRequest request,
        VentaPagadorService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            ventaId,
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/ventas/{ventaId}/pagadores/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarPagadorAsync(
        int ventaId,
        int pagadorId,
        UpdateVentaPagadorRequest request,
        VentaPagadorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                ventaId,
                pagadorId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarPagadorAsync(
        int ventaId,
        int pagadorId,
        VentaPagadorService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            ventaId,
            pagadorId,
            cancellationToken);

        return Results.NoContent();
    }
}
