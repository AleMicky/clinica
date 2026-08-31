using Clinica.Api.Modules.Almacenes.Almacen.Dtos;
using Clinica.Api.Modules.Almacenes.Almacen.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.Almacen.Endpoints;

public static class AlmacenEndpoints
{
    public static IEndpointRouteBuilder MapAlmacenEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/almacenes")
            .WithTags("Almacenes")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarAlmacenes");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerAlmacen");

        group.MapPost("/", CrearAsync)
            .WithName("CrearAlmacen")
            .Validate<CreateAlmacenRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarAlmacen")
            .Validate<UpdateAlmacenRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarAlmacen");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        AlmacenService service,
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
        AlmacenService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAlmacenRequest request,
        AlmacenService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/almacenes/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAlmacenRequest request,
        AlmacenService service,
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
        AlmacenService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
