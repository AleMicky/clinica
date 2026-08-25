using Clinica.Api.Modules.Seguridad.OpcionMenu.Services;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Endpoints;

public static class MenuUsuarioEndpoints
{
    public static IEndpointRouteBuilder MapMenuUsuarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/menu")
            .WithTags("Menú")
            .RequireAuthorization();

        group.MapGet(
                "/usuario",
                ObtenerMenuUsuarioAsync)
            .WithName("ObtenerMenuUsuario");

        return app;
    }

    private static async Task<IResult> ObtenerMenuUsuarioAsync(
        HttpContext httpContext,
        RolOpcionMenuService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerMenuUsuarioAsync(
            httpContext.User,
            cancellationToken);

        return Results.Ok(result);
    }
}