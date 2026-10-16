using Clinica.Api.Modules.Almacenes.Existencia.Dtos;
using Clinica.Api.Modules.Almacenes.Existencia.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.Existencia.Endpoints;

public static class ExistenciaEndpoints
{
    public static IEndpointRouteBuilder MapExistenciaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/existencias")
            .WithTags("Existencias")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarExistencias");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerExistencia");

        group.MapGet("/almacen/{almacenId:int}/producto/{productoId:int}", ObtenerPorAlmacenYProductoAsync)
            .WithName("ObtenerExistenciaPorAlmacenYProducto");

        group.MapPost("/", CrearAsync)
            .WithName("CrearExistencia")
            .Validate<CreateExistenciaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarExistencia")
            .Validate<UpdateExistenciaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarExistencia");

        group.MapPost("/aumentar-stock", AumentarStockAsync)
            .WithName("AumentarStockExistencia")
            .Validate<MovimientoStockExistenciaRequest>();

        group.MapPost("/disminuir-stock", DisminuirStockAsync)
            .WithName("DisminuirStockExistencia")
            .Validate<MovimientoStockExistenciaRequest>();

        group.MapPost("/reservar-stock", ReservarStockAsync)
            .WithName("ReservarStockExistencia")
            .Validate<ReservaStockExistenciaRequest>();

        group.MapPost("/liberar-stock", LiberarStockAsync)
            .WithName("LiberarStockExistencia")
            .Validate<ReservaStockExistenciaRequest>();

        group.MapPut("/actualizar-costo", ActualizarCostoPromedioAsync)
            .WithName("ActualizarCostoPromedioExistencia")
            .Validate<ActualizarCostoPromedioRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        int? productoId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                productoId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerPorAlmacenYProductoAsync(
        int almacenId,
        int productoId,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        var existencia = await service.ObtenerPorAlmacenYProductoAsync(
            almacenId,
            productoId,
            cancellationToken);

        return existencia is not null
            ? Results.Ok(existencia)
            : Results.NotFound();
    }

    private static async Task<IResult> CrearAsync(
        CreateExistenciaRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/existencias/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateExistenciaRequest request,
        IExistenciaService service,
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
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> AumentarStockAsync(
        MovimientoStockExistenciaRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        await service.AumentarStockAsync(
            request.AlmacenId,
            request.ProductoId,
            request.Cantidad,
            request.CostoUnitario,
            cancellationToken);

        var existencia = await service.ObtenerPorAlmacenYProductoAsync(
            request.AlmacenId,
            request.ProductoId,
            cancellationToken);

        return Results.Ok(existencia);
    }

    private static async Task<IResult> DisminuirStockAsync(
        MovimientoStockExistenciaRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        await service.DisminuirStockAsync(
            request.AlmacenId,
            request.ProductoId,
            request.Cantidad,
            cancellationToken);

        var existencia = await service.ObtenerPorAlmacenYProductoAsync(
            request.AlmacenId,
            request.ProductoId,
            cancellationToken);

        return Results.Ok(existencia);
    }

    private static async Task<IResult> ReservarStockAsync(
        ReservaStockExistenciaRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        await service.ReservarStockAsync(
            request.AlmacenId,
            request.ProductoId,
            request.Cantidad,
            cancellationToken);

        var existencia = await service.ObtenerPorAlmacenYProductoAsync(
            request.AlmacenId,
            request.ProductoId,
            cancellationToken);

        return Results.Ok(existencia);
    }

    private static async Task<IResult> LiberarStockAsync(
        ReservaStockExistenciaRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        await service.LiberarStockReservadoAsync(
            request.AlmacenId,
            request.ProductoId,
            request.Cantidad,
            cancellationToken);

        var existencia = await service.ObtenerPorAlmacenYProductoAsync(
            request.AlmacenId,
            request.ProductoId,
            cancellationToken);

        return Results.Ok(existencia);
    }

    private static async Task<IResult> ActualizarCostoPromedioAsync(
        ActualizarCostoPromedioRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        var existencia = await service.ActualizarCostoPromedioAsync(
            request.AlmacenId,
            request.ProductoId,
            request.CostoPromedio,
            cancellationToken);

        return Results.Ok(existencia);
    }
}
