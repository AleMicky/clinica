using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Endpoints;

public static class TurnoCajaEndpoints
{
    public static IEndpointRouteBuilder MapTurnoCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/turnos-caja")
            .WithTags("Turnos de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarTurnosCaja");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerTurnoCaja");
        group.MapPost("/", CrearAsync)
            .WithName("CrearTurnoCaja")
            .Validate<CreateTurnoCajaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarTurnoCaja")
            .Validate<UpdateTurnoCajaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarTurnoCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        TurnoCajaService service,
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
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateTurnoCajaRequest request,
        TurnoCajaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/turnos-caja/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTurnoCajaRequest request,
        TurnoCajaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        TurnoCajaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}
