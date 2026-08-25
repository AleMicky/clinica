using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Endpoints;

public static class OpcionMenuEndpoints
{
    public static IEndpointRouteBuilder MapOpcionMenuEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/opciones-menu")
            .WithTags("Opciones de Menú")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarOpcionesMenu");

        group.MapGet("/arbol", ObtenerArbolAsync)
            .WithName("ObtenerArbolOpcionesMenu");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerOpcionMenu");

        group.MapPost("/", CrearAsync)
            .WithName("CrearOpcionMenu")
            .Validate<CreateOpcionMenuRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarOpcionMenu")
            .Validate<UpdateOpcionMenuRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarOpcionMenu");

        group.MapPatch("/{id:int}/activar", ActivarAsync)
            .WithName("ActivarOpcionMenu");

        group.MapPatch("/{id:int}/inactivar", InactivarAsync)
            .WithName("InactivarOpcionMenu");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        OpcionMenuService service,
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
        OpcionMenuService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerArbolAsync(
        OpcionMenuService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerArbolAsync(
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateOpcionMenuRequest request,
        OpcionMenuService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/opciones-menu/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateOpcionMenuRequest request,
        OpcionMenuService service,
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
        OpcionMenuService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ActivarAsync(
        int id,
        OpcionMenuService service,
        CancellationToken cancellationToken)
    {
        await service.ActivarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> InactivarAsync(
        int id,
        OpcionMenuService service,
        CancellationToken cancellationToken)
    {
        await service.InactivarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}