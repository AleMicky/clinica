using Clinica.Api.Modules.Compras.DevolucionProveedor.Dtos;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Enums;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Endpoints;

public static class DevolucionProveedorEndpoints
{
    public static IEndpointRouteBuilder MapDevolucionProveedorEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/devoluciones-proveedor")
            .WithTags("Devoluciones a Proveedor")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarDevolucionesProveedor");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerDevolucionProveedor");

        group.MapPost("/", CrearAsync)
            .WithName("CrearDevolucionProveedor")
            .Validate<CreateDevolucionProveedorRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarDevolucionProveedor")
            .Validate<UpdateDevolucionProveedorRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarDevolucionProveedor");

        group.MapPost("/{id:int}/enviar-aprobacion", EnviarAprobacionAsync)
            .WithName("EnviarAprobacionDevolucionProveedor");

        group.MapPost("/{id:int}/aprobar", AprobarAsync)
            .WithName("AprobarDevolucionProveedor");

        group.MapPost("/{id:int}/rechazar", RechazarAsync)
            .WithName("RechazarDevolucionProveedor");

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarDevolucionProveedor");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularDevolucionProveedor")
            .Validate<AnularDevolucionProveedorRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? proveedorId,
        int? almacenId,
        int? recepcionCompraId,
        EstadoDevolucionProveedor? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                proveedorId,
                almacenId,
                recepcionCompraId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateDevolucionProveedorRequest request,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/devoluciones-proveedor/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateDevolucionProveedorRequest request,
        IDevolucionProveedorService service,
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
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> EnviarAprobacionAsync(
        int id,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.EnviarAprobacionAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AprobarAsync(
        int id,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AprobarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> RechazarAsync(
        int id,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RechazarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> ConfirmarAsync(
        int id,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConfirmarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularDevolucionProveedorRequest request,
        IDevolucionProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request,
                cancellationToken));
    }
}