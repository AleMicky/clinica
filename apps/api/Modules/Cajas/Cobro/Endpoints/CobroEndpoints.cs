using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Clinica.Api.Modules.Cajas.Cobro.Enums;
using Clinica.Api.Modules.Cajas.Cobro.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.Cobro.Endpoints;

public static class CobroEndpoints
{
    public static IEndpointRouteBuilder MapCobroEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/cobros")
            .WithTags("Cobros")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarCobros");

        group.MapGet("/metricas", ObtenerMetricasAsync)
            .WithName("ObtenerMetricasCobros");

        group.MapGet("/exportar-excel", ExportarExcelAsync)
            .WithName("ExportarCobrosExcel");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerCobro");

        group.MapPost("/generar-desde-venta", GenerarDesdeVentaAsync)
            .WithName("GenerarCobroDesdeVenta")
            .Validate<GenerarCobroDesdeVentaRequest>();

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarCobro")
            .Validate<ConfirmarCobroRequest>();

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularCobro")
            .Validate<AnularCobroRequest>();

        return app;
    }

    // ============================================================
    // LISTAR
    // ============================================================

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EstadoCobro? estado,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            estado,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        return Results.Ok(result);
    }

    // ============================================================
    // MÉTRICAS
    // ============================================================

    private static async Task<IResult> ObtenerMetricasAsync(
        string? search,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerMetricasAsync(
            search,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        return Results.Ok(result);
    }

    // ============================================================
    // EXPORTAR EXCEL
    // ============================================================

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        EstadoCobro? estado,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(
            search,
            estado,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        var fileName = $"reporte_cobranzas_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: fileName);
    }

    // ============================================================
    // OBTENER
    // ============================================================

    private static async Task<IResult> ObtenerAsync(
        int id,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    // ============================================================
    // GENERAR DESDE VENTA
    // ============================================================

    private static async Task<IResult> GenerarDesdeVentaAsync(
        GenerarCobroDesdeVentaRequest request,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.GenerarDesdeVentaAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/cobros/{result.Id}",
            result);
    }

    // ============================================================
    // CONFIRMAR
    // ============================================================

    private static async Task<IResult> ConfirmarAsync(
        int id,
        ConfirmarCobroRequest request,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ConfirmarAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }

    // ============================================================
    // ANULAR
    // ============================================================

    private static async Task<IResult> AnularAsync(
        int id,
        AnularCobroRequest request,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.AnularAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }
}