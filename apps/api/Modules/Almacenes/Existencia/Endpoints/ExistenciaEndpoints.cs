using Clinica.Api.Modules.Almacenes.Existencia.Dtos;
using Clinica.Api.Modules.Almacenes.Existencia.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.Existencia.Endpoints;

public static class ExistenciaEndpoints
{
    public static IEndpointRouteBuilder MapExistenciaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/existencias")
            .WithTags("Existencias")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarExistencias");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerExistencia");

        group.MapPost("/", CrearAsync)
            .WithName("CrearExistencia")
            .Validate<CreateExistenciaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarExistencia")
            .Validate<UpdateExistenciaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarExistencia");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        int? productoId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                productoId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateExistenciaRequest request,
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/existencias/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateExistenciaRequest request,
        IExistenciaService service,
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
        IExistenciaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
