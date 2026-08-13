using Clinica.Api.Modules.Servicios.Servicios.Dtos;
using Clinica.Api.Modules.Servicios.Servicios.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Servicios.Servicios.Endpoints;

public static class ServicioEndpoints
{
    public static IEndpointRouteBuilder MapServicioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/categorias-servicios/{categoriaId:int}/servicios")
            .WithTags("Servicios")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarServicios");

        group.MapGet("/tarifario", ServicioTarifarioAsync)
            .WithName("ServicioTarifario");

        group.MapGet("/{servicioId:int}", ObtenerAsync)
            .WithName("ObtenerServicio");

        group.MapPost("/", CrearAsync)
            .WithName("CrearServicio")
            .Validate<CreateServicioRequest>();

        group.MapPut("/{servicioId:int}", ActualizarAsync)
            .WithName("ActualizarServicio")
            .Validate<UpdateServicioRequest>();

        group.MapDelete("/{servicioId:int}", EliminarAsync)
            .WithName("EliminarServicio");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int categoriaId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        ServicioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                categoriaId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ServicioTarifarioAsync(
        int categoriaId,
        int? tarifarioId,
        ServicioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ServicioTarifarioAsync(
                categoriaId,
                tarifarioId,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int categoriaId,
        int servicioId,
        ServicioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                categoriaId,
                servicioId,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        int categoriaId,
        CreateServicioRequest request,
        ServicioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            categoriaId,
            request,
            cancellationToken);

        return Results.Created(
            $"/categorias-servicios/{categoriaId}/servicios/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int categoriaId,
        int servicioId,
        UpdateServicioRequest request,
        ServicioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                categoriaId,
                servicioId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int categoriaId,
        int servicioId,
        ServicioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            categoriaId,
            servicioId,
            cancellationToken);

        return Results.NoContent();
    }
}