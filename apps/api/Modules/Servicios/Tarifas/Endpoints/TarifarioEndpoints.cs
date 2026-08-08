using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using Clinica.Api.Modules.Servicios.Tarifas.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Servicios.Tarifas.Endpoints;

public static class TarifarioEndpoints
{
    public static IEndpointRouteBuilder MapTarifarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/tarifarios")
            .WithTags("Tarifarios")
            .RequireAuthorization();

        MapTarifarios(group);
        MapDetalles(group);

        return app;
    }

    private static void MapTarifarios(RouteGroupBuilder group)
    {
        group.MapGet("/", ListarAsync)
            .WithName("ListarTarifarios");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerTarifario");

        group.MapPost("/", CrearAsync)
            .WithName("CrearTarifario")
            .Validate<CreateTarifarioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarTarifario")
            .Validate<UpdateTarifarioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarTarifario");
    }

    private static void MapDetalles(RouteGroupBuilder group)
    {
        group.MapGet("/{tarifarioId:int}/detalles", ListarDetallesAsync)
            .WithName("ListarTarifarioDetalles");

        group.MapGet("/{tarifarioId:int}/detalles/{detalleId:int}", ObtenerDetalleAsync)
            .WithName("ObtenerTarifarioDetalle");

        group.MapPost("/{tarifarioId:int}/detalles", CrearDetalleAsync)
            .WithName("CrearTarifarioDetalle")
            .Validate<CreateTarifarioDetalleRequest>();

        group.MapPut("/{tarifarioId:int}/detalles/{detalleId:int}", ActualizarDetalleAsync)
            .WithName("ActualizarTarifarioDetalle")
            .Validate<UpdateTarifarioDetalleRequest>();

        group.MapDelete("/{tarifarioId:int}/detalles/{detalleId:int}", EliminarDetalleAsync)
            .WithName("EliminarTarifarioDetalle");
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        TarifarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        TarifarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateTarifarioRequest request,
        TarifarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/tarifarios/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTarifarioRequest request,
        TarifarioService service,
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
        TarifarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ListarDetallesAsync(
        int tarifarioId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        TarifarioDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                tarifarioId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerDetalleAsync(
        int tarifarioId,
        int detalleId,
        TarifarioDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                tarifarioId,
                detalleId,
                cancellationToken));
    }

    private static async Task<IResult> CrearDetalleAsync(
        int tarifarioId,
        CreateTarifarioDetalleRequest request,
        TarifarioDetalleService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            tarifarioId,
            request,
            cancellationToken);

        return Results.Created(
            $"/tarifarios/{tarifarioId}/detalles/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarDetalleAsync(
        int tarifarioId,
        int detalleId,
        UpdateTarifarioDetalleRequest request,
        TarifarioDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                tarifarioId,
                detalleId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarDetalleAsync(
        int tarifarioId,
        int detalleId,
        TarifarioDetalleService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            tarifarioId,
            detalleId,
            cancellationToken);

        return Results.NoContent();
    }
}
