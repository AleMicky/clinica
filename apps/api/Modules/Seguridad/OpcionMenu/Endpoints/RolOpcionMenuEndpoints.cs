using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Services;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Endpoints;

public static class RolOpcionMenuEndpoints
{
    public static IEndpointRouteBuilder MapRolOpcionMenuEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/roles/{rolId:int}/opciones-menu")
            .WithTags("Roles - Opciones de Menú")
            .RequireAuthorization();

        group.MapGet(
                "/",
                ObtenerAsync)
            .WithName("ObtenerOpcionesMenuRol");

        group.MapGet(
                "/arbol",
                ObtenerArbolAsync)
            .WithName("ObtenerArbolOpcionesMenuRol");

        group.MapPost(
                "/",
                CrearAsync)
            .WithName("CrearRolOpcionMenu")
            .Validate<CreateRolOpcionMenuRequest>();

        group.MapPut(
                "/",
                AsignarAsync)
            .WithName("AsignarOpcionesMenuRol")
            .Validate<AsignarRolOpcionMenuRequest>();

        group.MapDelete(
                "/{opcionMenuId:int}",
                QuitarAsync)
            .WithName("QuitarOpcionMenuRol");

        return app;
    }

    private static async Task<IResult> ObtenerAsync(
        int rolId,
        RolOpcionMenuService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            rolId,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerArbolAsync(
        int rolId,
        RolOpcionMenuService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerArbolAsync(
            rolId,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        int rolId,
        CreateRolOpcionMenuRequest request,
        RolOpcionMenuService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            rolId,
            request,
            cancellationToken);

        return Results.Created(
            $"/roles/{rolId}/opciones-menu/{result.OpcionMenuId}",
            result);
    }

    private static async Task<IResult> AsignarAsync(
        int rolId,
        AsignarRolOpcionMenuRequest request,
        RolOpcionMenuService service,
        CancellationToken cancellationToken)
    {
        await service.AsignarAsync(
            rolId,
            request,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> QuitarAsync(
        int rolId,
        int opcionMenuId,
        RolOpcionMenuService service,
        CancellationToken cancellationToken)
    {
        await service.QuitarAsync(
            rolId,
            opcionMenuId,
            cancellationToken);

        return Results.NoContent();
    }
}