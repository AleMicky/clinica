using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Endpoints;

public static class MovimientoCajaEndpoints
{
    public static IEndpointRouteBuilder MapMovimientoCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/movimientos-caja")
            .WithTags("Movimientos de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarMovimientosCaja");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerMovimientoCaja");
        group.MapPost("/", CrearAsync)
            .WithName("CrearMovimientoCaja")
            .Validate<CreateMovimientoCajaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarMovimientoCaja")
            .Validate<UpdateMovimientoCajaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarMovimientoCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        MovimientoCajaService service,
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
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMovimientoCajaRequest request,
        MovimientoCajaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/movimientos-caja/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateMovimientoCajaRequest request,
        MovimientoCajaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        MovimientoCajaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}