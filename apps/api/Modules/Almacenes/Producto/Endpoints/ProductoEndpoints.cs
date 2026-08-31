using Clinica.Api.Modules.Almacenes.Producto.Dtos;
using Clinica.Api.Modules.Almacenes.Producto.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.Producto.Endpoints;

public static class ProductoEndpoints
{
    public static IEndpointRouteBuilder MapProductoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/productos")
            .WithTags("Productos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarProductos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerProducto");

        group.MapPost("/", CrearAsync)
            .WithName("CrearProducto")
            .Validate<CreateProductoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarProducto")
            .Validate<UpdateProductoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarProducto");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? categoriaProductoId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                categoriaProductoId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateProductoRequest request,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/productos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateProductoRequest request,
        IProductoService service,
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
        IProductoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
