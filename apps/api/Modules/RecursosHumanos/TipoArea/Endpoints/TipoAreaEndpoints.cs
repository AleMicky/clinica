using Clinica.Api.Modules.RecursosHumanos.TipoArea.Dtos;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.RecursosHumanos.TipoArea.Endpoints;

public static class TipoAreaEndpoints
{
    public static IEndpointRouteBuilder MapTipoAreaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/tipos-area")
            .WithTags("Tipos de Área")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarTiposArea");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerTipoArea");
        group.MapPost("/", CrearAsync).WithName("CrearTipoArea");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarTipoArea");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarTipoArea");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        TipoAreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        TipoAreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateTipoAreaRequest request,
        TipoAreaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/tipos-area/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateTipoAreaRequest request,
        TipoAreaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        TipoAreaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}