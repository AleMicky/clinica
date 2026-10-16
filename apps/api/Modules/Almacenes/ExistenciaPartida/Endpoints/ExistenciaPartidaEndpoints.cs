using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Dtos;
using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.ExistenciaPartida.Endpoints;

public static class ExistenciaPartidaEndpoints
{
    public static IEndpointRouteBuilder MapExistenciaPartidaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/existencias-partidas")
            .WithTags("Existencias por Partida")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarExistenciasPartidas");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerExistenciaPartida");

        group.MapPost("/", CrearAsync)
            .WithName("CrearExistenciaPartida")
            .Validate<CreateExistenciaPartidaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarExistenciaPartida")
            .Validate<UpdateExistenciaPartidaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarExistenciaPartida");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? existenciaId,
        int? almacenId,
        int? productoId,
        int? partidaInventarioId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IExistenciaPartidaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                existenciaId,
                almacenId,
                productoId,
                partidaInventarioId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IExistenciaPartidaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateExistenciaPartidaRequest request,
        IExistenciaPartidaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/existencias-partidas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateExistenciaPartidaRequest request,
        IExistenciaPartidaService service,
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
        IExistenciaPartidaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
