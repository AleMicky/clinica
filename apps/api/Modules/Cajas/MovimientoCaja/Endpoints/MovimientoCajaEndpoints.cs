using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Services;
using Clinica.Api.Shared.Constants;
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

        group.MapGet("/", ListarAsync)
            .WithName("ListarMovimientosCaja");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerMovimientoCaja");

        group.MapPost("/", RegistrarAsync)
            .WithName("RegistrarMovimientoCaja")
            .Validate<RegistrarMovimientoCajaRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        int? turnoCajaId,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            turnoCajaId,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> RegistrarAsync(
        RegistrarMovimientoCajaRequest request,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.RegistrarAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/movimientos-caja/{result.Id}",
            result);
    }
}