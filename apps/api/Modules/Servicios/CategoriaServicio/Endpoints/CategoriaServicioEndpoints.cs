using Clinica.Api.Modules.Servicios.CategoriaServicio.Dtos;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Servicios.CategoriaServicio.Endpoints;

public static class CategoriaServicioEndpoints
{
    public static IEndpointRouteBuilder MapCategoriaServicioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/categorias-servicios")
            .WithTags("Categorías de Servicio")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarCategoriasServicio");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerCategoriaServicio");

        group.MapPost("/", CrearAsync)
            .WithName("CrearCategoriaServicio")
            .Validate<CreateCategoriaServicioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCategoriaServicio")
            .Validate<UpdateCategoriaServicioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarCategoriaServicio");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CategoriaServicioService service,
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
        CategoriaServicioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCategoriaServicioRequest request,
        CategoriaServicioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/categorias-servicios/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCategoriaServicioRequest request,
        CategoriaServicioService service,
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
        CategoriaServicioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}