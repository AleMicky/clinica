using Clinica.Api.Modules.Almacenes.Marca.Dtos;
using Clinica.Api.Modules.Almacenes.Marca.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.Marca.Endpoints;

public static class MarcaEndpoints
{
    public static IEndpointRouteBuilder MapMarcaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/marcas")
            .WithTags("Marcas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarMarcas");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerMarca");

        group.MapPost("/", CrearAsync)
            .WithName("CrearMarca")
            .Validate<CreateMarcaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarMarca")
            .Validate<UpdateMarcaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarMarca");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        MarcaService service,
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
        MarcaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMarcaRequest request,
        MarcaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/marcas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateMarcaRequest request,
        MarcaService service,
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
        MarcaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
