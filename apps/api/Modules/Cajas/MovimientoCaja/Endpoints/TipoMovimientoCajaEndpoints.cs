using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Endpoints;

public static class TipoMovimientoCajaEndpoints
{
    public static IEndpointRouteBuilder MapTipoMovimientoCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/movimientos-caja/tipos")
            .WithTags("Tipos de Movimiento de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarTiposMovimientoCaja");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerTipoMovimientoCaja");

        group.MapPost("/", CrearAsync)
            .WithName("CrearTipoMovimientoCaja")
            .Validate<CreateTipoMovimientoCajaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarTipoMovimientoCaja")
            .Validate<UpdateTipoMovimientoCajaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarTipoMovimientoCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        string? naturaleza,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarTiposAsync(
            naturaleza,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerTipoAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        CreateTipoMovimientoCajaRequest request,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearTipoAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/movimientos-caja/tipos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTipoMovimientoCajaRequest request,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarTipoAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarTipoAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
