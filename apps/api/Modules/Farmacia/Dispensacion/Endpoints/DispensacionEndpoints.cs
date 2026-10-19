using Clinica.Api.Modules.Farmacia.Dispensacion.Dtos;
using Clinica.Api.Modules.Farmacia.Dispensacion.Enums;
using Clinica.Api.Modules.Farmacia.Dispensacion.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Endpoints;

public static class DispensacionEndpoints
{
    public static IEndpointRouteBuilder MapDispensacionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/farmacia/dispensaciones")
            .WithTags("Farmacia - Dispensación")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarDispensaciones");

        group.MapGet("/metricas", ObtenerMetricasAsync)
            .WithName("ObtenerMetricasDispensaciones");

        group.MapGet("/medicamentos-stock", ListarMedicamentosStockAsync)
            .WithName("ListarMedicamentosStockFarmacia");

        group.MapGet("/{id:int}", ObtenerPorIdAsync)
            .WithName("ObtenerDispensacionPorId");

        group.MapPost("/", CrearAsync)
            .WithName("CrearDispensacion");

        group.MapPost("/{id:int}/cobrar", RegistrarCobroAsync)
            .WithName("RegistrarCobroDispensacion");

        group.MapPost("/{id:int}/entregar", EntregarMedicamentosAsync)
            .WithName("EntregarMedicamentosDispensacion");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularDispensacion");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EstadoDispensacion? estado,
        TipoDispensacion? tipo,
        int? almacenId,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            estado,
            tipo,
            almacenId,
            fechaDesde,
            fechaHasta,
            cancellationToken);

        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ObtenerPorIdAsync(
        int id,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerPorIdAsync(id, cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ObtenerMetricasAsync(
        int? almacenId,
        DateOnly? fechaDesde,
        DateOnly? fechaHasta,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerMetricasAsync(almacenId, fechaDesde, fechaHasta, cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ListarMedicamentosStockAsync(
        int almacenId,
        string? search,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarMedicamentosStockAsync(almacenId, search, cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        CreateDispensacionRequest request,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(request, cancellationToken);
        return TypedResults.Created($"/api/v1/farmacia/dispensaciones/{result.Id}", result);
    }

    private static async Task<IResult> RegistrarCobroAsync(
        int id,
        RegistrarCobroDispensacionRequest request,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.RegistrarCobroAsync(id, request, cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> EntregarMedicamentosAsync(
        int id,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.EntregarMedicamentosAsync(id, cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularDispensacionRequest request,
        IDispensacionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.AnularAsync(id, request, cancellationToken);
        return TypedResults.Ok(result);
    }
}
