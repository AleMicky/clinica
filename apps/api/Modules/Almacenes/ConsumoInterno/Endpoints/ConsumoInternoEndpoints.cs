using Clinica.Api.Modules.Almacenes.ConsumoInterno.Dtos;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Enums;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Endpoints;

public static class ConsumoInternoEndpoints
{
    public static IEndpointRouteBuilder MapConsumoInternoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/consumos-interno")
            .WithTags("Consumos Internos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarConsumosInterno");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerConsumoInterno");

        group.MapPost("/", CrearAsync)
            .WithName("CrearConsumoInterno")
            .Validate<CreateConsumoInternoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarConsumoInterno")
            .Validate<UpdateConsumoInternoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarConsumoInterno");

        group.MapPost("/{id:int}/confirmar", ConfirmarAsync)
            .WithName("ConfirmarConsumoInterno");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularConsumoInterno")
            .Validate<AnularConsumoInternoRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        int? areaId,
        EstadoConsumoInterno? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IConsumoInternoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                areaId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IConsumoInternoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateConsumoInternoRequest request,
        IConsumoInternoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/consumos-interno/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateConsumoInternoRequest request,
        IConsumoInternoService service,
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
        IConsumoInternoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ConfirmarAsync(
        int id,
        IConsumoInternoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ConfirmarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularConsumoInternoRequest request,
        IConsumoInternoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request,
                cancellationToken));
    }
}