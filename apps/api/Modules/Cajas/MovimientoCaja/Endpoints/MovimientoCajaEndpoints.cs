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

        group.MapGet("/metricas", ObtenerMetricasAsync)
            .WithName("ObtenerMetricasMovimientosCaja");

        group.MapGet("/exportar-excel", ExportarExcelAsync)
            .WithName("ExportarMovimientosCajaExcel");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerMovimientoCaja");

        group.MapPost("/", RegistrarAsync)
            .WithName("RegistrarMovimientoCaja")
            .Validate<RegistrarMovimientoCajaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarMovimientoCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        int? turnoCajaId,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            turnoCajaId,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerMetricasAsync(
        string? search,
        int? turnoCajaId,
        string? naturaleza,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerMetricasAsync(
            search,
            turnoCajaId,
            naturaleza,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        int? turnoCajaId,
        string? naturaleza,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(
            search,
            turnoCajaId,
            naturaleza,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        var fileName = $"reporte_movimientos_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: fileName);
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

    private static async Task<IResult> EliminarAsync(
        int id,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}