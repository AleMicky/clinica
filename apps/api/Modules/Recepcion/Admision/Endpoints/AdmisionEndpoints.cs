using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Recepcion.Admision.Endpoints;

public static class AdmisionEndpoints
{
    public static IEndpointRouteBuilder MapAdmisionEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/admisiones")
            .WithTags("Admisiones")
            .RequireAuthorization();

        MapAdmisiones(group);
        MapDetalles(group);

        return app;
    }

    private static void MapAdmisiones(RouteGroupBuilder group)
    {
        group.MapGet("/", ListarAsync)
            .WithName("ListarAdmisiones");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerAdmision");

        group.MapPost("/", CrearAsync)
            .WithName("CrearAdmision")
            .Validate<CreateAdmisionRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarAdmision")
            .Validate<UpdateAdmisionRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarAdmision");
    }

    private static void MapDetalles(RouteGroupBuilder group)
    {
        group.MapGet("/{admisionId:int}/detalles", ListarDetallesAsync)
            .WithName("ListarAdmisionDetalles");

        group.MapGet("/{admisionId:int}/detalles/{detalleId:int}", ObtenerDetalleAsync)
            .WithName("ObtenerAdmisionDetalle");

        group.MapPost("/{admisionId:int}/detalles", CrearDetalleAsync)
            .WithName("CrearAdmisionDetalle")
            .Validate<CreateAdmisionDetalleRequest>();

        group.MapPut("/{admisionId:int}/detalles/{detalleId:int}", ActualizarDetalleAsync)
            .WithName("ActualizarAdmisionDetalle")
            .Validate<UpdateAdmisionDetalleRequest>();

        group.MapDelete("/{admisionId:int}/detalles/{detalleId:int}", EliminarDetalleAsync)
            .WithName("EliminarAdmisionDetalle");
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        AdmisionService service,
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
        AdmisionService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAdmisionRequest request,
        AdmisionService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/admisiones/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAdmisionRequest request,
        AdmisionService service,
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
        AdmisionService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ListarDetallesAsync(
        int admisionId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        AdmisionDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                admisionId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerDetalleAsync(
        int admisionId,
        int detalleId,
        AdmisionDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                admisionId,
                detalleId,
                cancellationToken));
    }

    private static async Task<IResult> CrearDetalleAsync(
        int admisionId,
        CreateAdmisionDetalleRequest request,
        AdmisionDetalleService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            admisionId,
            request,
            cancellationToken);

        return Results.Created(
            $"/admisiones/{admisionId}/detalles/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarDetalleAsync(
        int admisionId,
        int detalleId,
        UpdateAdmisionDetalleRequest request,
        AdmisionDetalleService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                admisionId,
                detalleId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarDetalleAsync(
        int admisionId,
        int detalleId,
        AdmisionDetalleService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            admisionId,
            detalleId,
            cancellationToken);

        return Results.NoContent();
    }
}
