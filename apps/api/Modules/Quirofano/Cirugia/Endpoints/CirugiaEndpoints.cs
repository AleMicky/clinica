using Clinica.Api.Modules.Quirofano.Cirugia.Dtos;
using Clinica.Api.Modules.Quirofano.Cirugia.Enums;
using Clinica.Api.Modules.Quirofano.Cirugia.Services;
using Clinica.Api.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Endpoints;

public static class CirugiaEndpoints
{
    public static void MapCirugiaEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/quirofano/cirugias")
            .WithTags("Quirofano - Cirugias")
            .RequireAuthorization();

        group.MapGet("/", async (
            [FromQuery] EstadoCirugia? estado,
            [FromQuery] TipoCirugia? tipo,
            [FromQuery] int? cirujanoId,
            [FromQuery] string? sala,
            [FromQuery] DateOnly? fechaDesde,
            [FromQuery] DateOnly? fechaHasta,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var pagination = new PaginationRequest { Page = page, PageSize = pageSize };
            var result = await service.ListarAsync(
                estado, tipo, cirujanoId, sala, fechaDesde, fechaHasta, search, pagination, ct);
            return Results.Ok(result);
        });

        group.MapGet("/metricas", async (
            [FromQuery] DateOnly? fechaDesde,
            [FromQuery] DateOnly? fechaHasta,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.ObtenerMetricasAsync(fechaDesde, fechaHasta, ct);
            return Results.Ok(result);
        });

        group.MapGet("/materiales-stock", async (
            [FromQuery] int? almacenId,
            [FromQuery] string? search,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.ListarMaterialesStockAsync(almacenId, search, ct);
            return Results.Ok(result);
        });

        group.MapGet("/{id:int}", async (
            int id,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.ObtenerPorIdAsync(id, ct);
            return Results.Ok(result);
        });

        group.MapPost("/", async (
            [FromBody] CreateCirugiaRequest request,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.CrearAsync(request, ct);
            return Results.Created($"/api/v1/quirofano/cirugias/{result.Id}", result);
        });

        group.MapPut("/{id:int}", async (
            int id,
            [FromBody] UpdateCirugiaRequest request,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.ActualizarAsync(id, request, ct);
            return Results.Ok(result);
        });

        group.MapPost("/{id:int}/iniciar", async (
            int id,
            [FromBody] IniciarCirugiaRequest request,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.IniciarCirugiaAsync(id, request, ct);
            return Results.Ok(result);
        });

        group.MapPost("/{id:int}/gastos-materiales", async (
            int id,
            [FromBody] RegistrarGastoMaterialCirugiaRequest request,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.RegistrarGastosMaterialesAsync(id, request, ct);
            return Results.Ok(result);
        });

        group.MapPost("/{id:int}/finalizar", async (
            int id,
            [FromBody] FinalizarCirugiaRequest request,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.FinalizarCirugiaAsync(id, request, ct);
            return Results.Ok(result);
        });

        group.MapPost("/{id:int}/cancelar", async (
            int id,
            [FromBody] CancelarCirugiaRequest request,
            [FromServices] ICirugiaService service = null!,
            CancellationToken ct = default) =>
        {
            var result = await service.CancelarCirugiaAsync(id, request, ct);
            return Results.Ok(result);
        });
    }
}
