using Clinica.Api.Modules.Almacenes.CategoriaProducto.Dtos;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.CategoriaProducto.Endpoints;

public static class CategoriaProductoEndpoints
{
    public static IEndpointRouteBuilder MapCategoriaProductoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/categorias-producto")
            .WithTags("Categorías de Producto")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarCategoriasProducto");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerCategoriaProducto");

        group.MapPost("/", CrearAsync)
            .WithName("CrearCategoriaProducto")
            .Validate<CreateCategoriaProductoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCategoriaProducto")
            .Validate<UpdateCategoriaProductoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarCategoriaProducto");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? categoriaPadreId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        ICategoriaProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                categoriaPadreId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        ICategoriaProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCategoriaProductoRequest request,
        ICategoriaProductoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/categorias-producto/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCategoriaProductoRequest request,
        ICategoriaProductoService service,
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
        ICategoriaProductoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
