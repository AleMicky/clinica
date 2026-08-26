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
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            estado,
            cancellationToken);

        return Results.Ok(result);
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