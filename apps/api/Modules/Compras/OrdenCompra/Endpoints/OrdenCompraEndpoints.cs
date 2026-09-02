using Clinica.Api.Modules.Compras.OrdenCompra.Dtos;
using Clinica.Api.Modules.Compras.OrdenCompra.Enums;
using Clinica.Api.Modules.Compras.OrdenCompra.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Compras.OrdenCompra.Endpoints;

public static class OrdenCompraEndpoints
{
    public static IEndpointRouteBuilder MapOrdenCompraEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/ordenes-compra")
            .WithTags("Ordenes de Compra")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarOrdenesCompra");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerOrdenCompra");

        group.MapPost("/", CrearAsync)
            .WithName("CrearOrdenCompra")
            .Validate<CreateOrdenCompraRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarOrdenCompra")
            .Validate<UpdateOrdenCompraRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarOrdenCompra");

        group.MapPost("/{id:int}/enviar-aprobacion", EnviarAprobacionAsync)
            .WithName("EnviarAprobacionOrdenCompra");

        group.MapPost("/{id:int}/aprobar", AprobarAsync)
            .WithName("AprobarOrdenCompra");

        group.MapPost("/{id:int}/enviar-proveedor", EnviarProveedorAsync)
            .WithName("EnviarProveedorOrdenCompra");

        group.MapPost("/{id:int}/recibir", RecibirAsync)
            .WithName("RecibirOrdenCompra")
            .Validate<RecibirOrdenCompraRequest>();

        group.MapPost("/{id:int}/cancelar", CancelarAsync)
            .WithName("CancelarOrdenCompra")
            .Validate<CancelarOrdenCompraRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? proveedorId,
        int? almacenId,
        EstadoOrdenCompra? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                proveedorId,
                almacenId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateOrdenCompraRequest request,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/ordenes-compra/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateOrdenCompraRequest request,
        IOrdenCompraService service,
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
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> EnviarAprobacionAsync(
        int id,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.EnviarAprobacionAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AprobarAsync(
        int id,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AprobarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> EnviarProveedorAsync(
        int id,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.EnviarProveedorAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> RecibirAsync(
        int id,
        RecibirOrdenCompraRequest request,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RecibirAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> CancelarAsync(
        int id,
        CancelarOrdenCompraRequest request,
        IOrdenCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CancelarAsync(
                id,
                request,
                cancellationToken));
    }
}
