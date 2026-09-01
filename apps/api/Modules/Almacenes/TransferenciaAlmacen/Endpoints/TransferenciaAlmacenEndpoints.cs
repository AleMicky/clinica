using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Dtos;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Enums;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Endpoints;

public static class TransferenciaAlmacenEndpoints
{
    public static IEndpointRouteBuilder MapTransferenciaAlmacenEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/transferencias-almacen")
            .WithTags("Transferencias entre Almacenes")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarTransferenciasAlmacen");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerTransferenciaAlmacen");

        group.MapPost("/", CrearAsync)
            .WithName("CrearTransferenciaAlmacen")
            .Validate<CreateTransferenciaAlmacenRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarTransferenciaAlmacen")
            .Validate<UpdateTransferenciaAlmacenRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarTransferenciaAlmacen");

        group.MapPost("/{id:int}/solicitar", SolicitarAsync)
            .WithName("SolicitarTransferenciaAlmacen");

        group.MapPost("/{id:int}/aprobar", AprobarAsync)
            .WithName("AprobarTransferenciaAlmacen")
            .Validate<AprobarTransferenciaAlmacenRequest>();

        group.MapPost("/{id:int}/despachar", DespacharAsync)
            .WithName("DespacharTransferenciaAlmacen")
            .Validate<DespacharTransferenciaAlmacenRequest>();

        group.MapPost("/{id:int}/recibir", RecibirAsync)
            .WithName("RecibirTransferenciaAlmacen")
            .Validate<RecibirTransferenciaAlmacenRequest>();

        group.MapPost("/{id:int}/cancelar", CancelarAsync)
            .WithName("CancelarTransferenciaAlmacen")
            .Validate<CancelarTransferenciaAlmacenRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenOrigenId,
        int? almacenDestinoId,
        EstadoTransferenciaAlmacen? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenOrigenId,
                almacenDestinoId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateTransferenciaAlmacenRequest request,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/transferencias-almacen/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTransferenciaAlmacenRequest request,
        ITransferenciaAlmacenService service,
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
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> SolicitarAsync(
        int id,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.SolicitarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AprobarAsync(
        int id,
        AprobarTransferenciaAlmacenRequest request,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AprobarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> DespacharAsync(
        int id,
        DespacharTransferenciaAlmacenRequest request,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.DespacharAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> RecibirAsync(
        int id,
        RecibirTransferenciaAlmacenRequest request,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RecibirAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> CancelarAsync(
        int id,
        CancelarTransferenciaAlmacenRequest request,
        ITransferenciaAlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CancelarAsync(
                id,
                request,
                cancellationToken));
    }
}
