using Clinica.Api.Modules.RecursosHumanos.Area.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Area.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Endpoints;

public static class AreaEndpoints
{
    public static IEndpointRouteBuilder MapAreaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/areas")
            .WithTags("Áreas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarAreas");
        group.MapGet("/arbol", ArbolAsync).WithName("ArbolAreas");
        group.MapGet("/{id:int}/subareas", SubareasAsync)
            .WithName("SubareasArea");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerArea");
        group.MapPost("/", CrearAsync).WithName("CrearArea");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarArea");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarArea");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ArbolAsync(
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerArbolAsync(cancellationToken));
    }

    private static async Task<IResult> SubareasAsync(
        int id,
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerSubareasAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAreaRequest request,
        AreaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/areas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAreaRequest request,
        AreaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        AreaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}