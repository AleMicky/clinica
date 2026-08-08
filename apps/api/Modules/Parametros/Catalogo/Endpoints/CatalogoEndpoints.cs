using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using Clinica.Api.Modules.Parametros.Catalogo.Services;
using Clinica.Api.Modules.Parametros.Catalogo.Validators;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Parametros.Catalogo.Endpoints;

public static class CatalogoEndpoints
{
    public static IEndpointRouteBuilder MapCatalogoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/catalogos")
            .WithTags("Catálogos")
            .RequireAuthorization();

        MapGrupos(group);
        MapItems(group);

        return app;
    }

    private static void MapGrupos(RouteGroupBuilder group)
    {
        group.MapGet("/", ListarGruposAsync).WithName("ListarCatalogos");
        group.MapPost("/", CrearGrupoAsync).WithName("CrearCatalogo").Validate<CreateCatalogoGrupoRequestValidator>();
        group.MapGet("/{id:int}", ObtenerGrupoAsync).WithName("ObtenerCatalogo");
        group.MapPut("/{id:int}", ActualizarGrupoAsync).WithName("ActualizarCatalogo").Validate<UpdateCatalogoGrupoRequestValidator>();
        group.MapDelete("/{id:int}", EliminarGrupoAsync).WithName("EliminarCatalogo");
    }

    private static void MapItems(RouteGroupBuilder group)
    {
        group.MapGet("/{grupoId:int}/items", ListarItemsAsync).WithName("ListarCatalogoItems");
        group.MapGet("/{codigo}/items", ListarItemsPorCodigoAsync).WithName("ListarCatalogoItemsPorCodigo");
        group.MapGet("/{grupoId:int}/items/{itemId:int}", ObtenerItemAsync).WithName("ObtenerCatalogoItem");
        group.MapPost("/{grupoId:int}/items", CrearItemAsync).WithName("CrearCatalogoItem").Validate<CreateCatalogoItemRequestValidator>();
        group.MapPut("/{grupoId:int}/items/{itemId:int}", ActualizarItemAsync).WithName("ActualizarCatalogoItem").Validate<UpdateCatalogoItemRequestValidator>();
        group.MapDelete("/{grupoId:int}/items/{itemId:int}", EliminarItemAsync).WithName("EliminarCatalogoItem");
    }

    private static async Task<IResult> ListarGruposAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CatalogoGrupoService service,
        CancellationToken cancellationToken
    )
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken)
        );
    }

    private static async Task<IResult> ObtenerGrupoAsync(
        int id,
        CatalogoGrupoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken)
        );
    }

    private static async Task<IResult> CrearGrupoAsync(
        CreateCatalogoGrupoRequest request,
        CatalogoGrupoService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/catalogos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarGrupoAsync(
        int id,
        UpdateCatalogoGrupoRequest request,
        CatalogoGrupoService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request)
        );
    }

    private static async Task<IResult> EliminarGrupoAsync(
        int id,
        CatalogoGrupoService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }

    private static async Task<IResult> ListarItemsAsync(
        int grupoId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        CatalogoItemService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                grupoId,
                pagination,
                search,
                cancellationToken)
        );
    }

    private static async Task<IResult> ListarItemsPorCodigoAsync(
        string codigo,
        [AsParameters] PaginationRequest pagination,
        string? search,
        CatalogoItemService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarPorCodigoAsync(
                codigo,
                pagination,
                search,
                cancellationToken)
        );
    }

    private static async Task<IResult> ObtenerItemAsync(
        int grupoId,
        int itemId,
        CatalogoItemService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                grupoId,
                itemId,
                cancellationToken)
        );
    }

    private static async Task<IResult> CrearItemAsync(
        int grupoId,
        CreateCatalogoItemRequest request,
        CatalogoItemService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            grupoId,
            request,
            cancellationToken);

        return Results.Created(
            $"/catalogos/{grupoId}/items/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarItemAsync(
        int grupoId,
        int itemId,
        UpdateCatalogoItemRequest request,
        CatalogoItemService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                grupoId,
                itemId,
                request,
                cancellationToken)
        );
    }

    private static async Task<IResult> EliminarItemAsync(
        int grupoId,
        int itemId,
        CatalogoItemService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            grupoId,
            itemId,
            cancellationToken);

        return Results.NoContent();
    }
}