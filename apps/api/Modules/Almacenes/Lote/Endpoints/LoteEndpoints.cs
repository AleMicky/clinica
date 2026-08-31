using Clinica.Api.Modules.Almacenes.Lote.Dtos;
using Clinica.Api.Modules.Almacenes.Lote.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.Lote.Endpoints;

public static class LoteEndpoints
{
    public static IEndpointRouteBuilder MapLoteEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/lotes")
            .WithTags("Lotes")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarLotes");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerLote");

        group.MapPost("/", CrearAsync)
            .WithName("CrearLote")
            .Validate<CreateLoteRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarLote")
            .Validate<UpdateLoteRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarLote");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? productoId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        ILoteService service,
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
        ILoteService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateLoteRequest request,
        ILoteService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/lotes/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateLoteRequest request,
        ILoteService service,
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
        ILoteService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
