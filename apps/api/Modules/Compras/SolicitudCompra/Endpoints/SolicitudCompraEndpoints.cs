using Clinica.Api.Modules.Compras.SolicitudCompra.Dtos;
using Clinica.Api.Modules.Compras.SolicitudCompra.Enums;
using Clinica.Api.Modules.Compras.SolicitudCompra.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Endpoints;

public static class SolicitudCompraEndpoints
{
    public static IEndpointRouteBuilder MapSolicitudCompraEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/solicitudes-compra")
            .WithTags("Solicitudes de Compra")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarSolicitudesCompra");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerSolicitudCompra");

        group.MapPost("/", CrearAsync)
            .WithName("CrearSolicitudCompra")
            .Validate<CreateSolicitudCompraRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarSolicitudCompra")
            .Validate<UpdateSolicitudCompraRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarSolicitudCompra");

        group.MapPost("/{id:int}/enviar-aprobacion", EnviarAprobacionAsync)
            .WithName("EnviarAprobacionSolicitudCompra");

        group.MapPost("/{id:int}/aprobar", AprobarAsync)
            .WithName("AprobarSolicitudCompra")
            .Validate<AprobarSolicitudCompraRequest>();

        group.MapPost("/{id:int}/rechazar", RechazarAsync)
            .WithName("RechazarSolicitudCompra")
            .Validate<RechazarSolicitudCompraRequest>();

        group.MapPost("/{id:int}/cancelar", CancelarAsync)
            .WithName("CancelarSolicitudCompra")
            .Validate<CancelarSolicitudCompraRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        EstadoSolicitudCompra? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateSolicitudCompraRequest request,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/solicitudes-compra/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateSolicitudCompraRequest request,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> EnviarAprobacionAsync(
        int id,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.EnviarAprobacionAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AprobarAsync(
        int id,
        AprobarSolicitudCompraRequest request,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AprobarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> RechazarAsync(
        int id,
        RechazarSolicitudCompraRequest request,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RechazarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> CancelarAsync(
        int id,
        CancelarSolicitudCompraRequest request,
        ISolicitudCompraService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CancelarAsync(
                id,
                request,
                cancellationToken));
    }
}
