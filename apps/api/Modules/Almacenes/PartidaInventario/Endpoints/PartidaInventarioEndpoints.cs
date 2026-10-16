using Clinica.Api.Modules.Almacenes.PartidaInventario.Dtos;
using Clinica.Api.Modules.Almacenes.PartidaInventario.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.PartidaInventario.Endpoints;

public static class PartidaInventarioEndpoints
{
    public static IEndpointRouteBuilder MapPartidaInventarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/partidas-inventario")
            .WithTags("Partidas de Inventario")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarPartidasInventario");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerPartidaInventario");

        group.MapPost("/", CrearAsync)
            .WithName("CrearPartidaInventario")
            .Validate<CreatePartidaInventarioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarPartidaInventario")
            .Validate<UpdatePartidaInventarioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarPartidaInventario");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? productoId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IPartidaInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                productoId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IPartidaInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreatePartidaInventarioRequest request,
        IPartidaInventarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/partidas-inventario/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdatePartidaInventarioRequest request,
        IPartidaInventarioService service,
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
        IPartidaInventarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
