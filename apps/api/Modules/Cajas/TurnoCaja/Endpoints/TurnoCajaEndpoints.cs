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

        group.MapGet("/", ListarAsync)
            .WithName("ListarTurnosCaja");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerTurnoCaja");

        group.MapGet("/{id:int}/resumen-cierre", ObtenerResumenCierreAsync)
            .WithName("ObtenerResumenCierreTurnoCaja");

        group.MapGet("/empleado/{empleadoId:int}/abierto", ObtenerAbiertoEmpleadoAsync)
            .WithName("ObtenerTurnoCajaAbiertoEmpleado");

        group.MapGet("/caja/{cajaId:int}/abierto", ObtenerAbiertoCajaAsync)
            .WithName("ObtenerTurnoCajaAbiertoCaja");

        group.MapPost("/abrir", AbrirAsync)
            .WithName("AbrirTurnoCaja")
            .Validate<AbrirTurnoCajaRequest>();

        group.MapPost("/{id:int}/cerrar", CerrarAsync)
            .WithName("CerrarTurnoCaja")
            .Validate<CerrarTurnoCajaRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerResumenCierreAsync(
        int id,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerResumenCierreAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAbiertoEmpleadoAsync(
        int empleadoId,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerTurnoAbiertoEmpleadoAsync(
            empleadoId,
            cancellationToken);

        return result is null
            ? Results.NoContent()
            : Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAbiertoCajaAsync(
        int cajaId,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerTurnoAbiertoCajaAsync(
            cajaId,
            cancellationToken);

        return result is null
            ? Results.NoContent()
            : Results.Ok(result);
    }

    private static async Task<IResult> AbrirAsync(
        AbrirTurnoCajaRequest request,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.AbrirAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/turnos-caja/{result.Id}",
            result);
    }

    private static async Task<IResult> CerrarAsync(
        int id,
        CerrarTurnoCajaRequest request,
        TurnoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CerrarAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }
}