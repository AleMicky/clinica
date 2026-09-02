using Clinica.Api.Modules.Compras.Proveedor.Dtos;
using Clinica.Api.Modules.Compras.Proveedor.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Compras.Proveedor.Endpoints;

public static class ProveedorEndpoints
{
    public static IEndpointRouteBuilder MapProveedorEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/proveedores")
            .WithTags("Proveedores")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarProveedores");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerProveedor");

        group.MapPost("/", CrearAsync)
            .WithName("CrearProveedor")
            .Validate<CreateProveedorRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarProveedor")
            .Validate<UpdateProveedorRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarProveedor");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        string? search,
        [AsParameters] PaginationRequest pagination,
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateProveedorRequest request,
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/proveedores/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateProveedorRequest request,
        IProveedorService service,
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
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
