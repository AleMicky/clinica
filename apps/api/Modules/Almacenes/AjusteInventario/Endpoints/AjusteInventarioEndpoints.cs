using Clinica.Api.Modules.Almacenes.AjusteInventario.Dtos;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Enums;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Endpoints;

public static class AjusteInventarioEndpoints
{
    public static IEndpointRouteBuilder MapAjusteInventarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/ajustes-inventario")
            .WithTags("Ajustes de Inventario")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarAjustesInventario");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerAjusteInventario");

        group.MapPost("/", CrearAsync)
            .WithName("CrearAjusteInventario")
            .Validate<CreateAjusteInventarioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarAjusteInventario")
            .Validate<UpdateAjusteInventarioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarAjusteInventario");

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarAjusteInventario");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularAjusteInventario")
            .Validate<AnularAjusteInventarioRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        TipoAjusteInventario? tipo,
        EstadoAjusteInventario? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IAjusteInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                tipo,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IAjusteInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAjusteInventarioRequest request,
        IAjusteInventarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/ajustes-inventario/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAjusteInventarioRequest request,
        IAjusteInventarioService service,
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
        IAjusteInventarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ConfirmarAsync(
        int id,
        IAjusteInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConfirmarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularAjusteInventarioRequest request,
        IAjusteInventarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request,
                cancellationToken));
    }
}
