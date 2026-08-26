using Clinica.Api.Modules.Notificaciones.Services;
using Clinica.Api.Shared.Extensions;

namespace Clinica.Api.Modules.Notificaciones.Endpoints;

public static class NotificacionEndpoints
{
    public static IEndpointRouteBuilder MapNotificacionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/notificaciones")
            .WithTags("Notificaciones")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarNotificaciones");
        group.MapGet("/contador", ContadorAsync).WithName("ContadorNotificacionesNoLeidas");
        group.MapPatch("/{id:int}/leer", MarcarComoLeidaAsync).WithName("MarcarNotificacionComoLeida");
        group.MapPatch("/leer-todas", MarcarTodasComoLeidasAsync).WithName("MarcarTodasNotificacionesComoLeidas");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        HttpContext httpContext,
        INotificacionService service,
        CancellationToken cancellationToken,
        int cantidad = 20)
    {
        var usuarioId = httpContext.User.GetUserId();

        var result = await service.ListarAsync(
            usuarioId,
            cantidad,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ContadorAsync(
        HttpContext httpContext,
        INotificacionService service,
        CancellationToken cancellationToken)
    {
        var usuarioId = httpContext.User.GetUserId();

        var cantidad = await service.ObtenerCantidadNoLeidasAsync(usuarioId, cancellationToken);

        return Results.Ok(new
        {
            cantidad
        });
    }

    private static async Task<IResult> MarcarComoLeidaAsync(
            int id,
            HttpContext httpContext,
            INotificacionService service,
            CancellationToken cancellationToken)
    {
        var usuarioId = httpContext.User.GetUserId();

        await service.MarcarComoLeidaAsync(
            id,
            usuarioId,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> MarcarTodasComoLeidasAsync(
            HttpContext httpContext,
            INotificacionService service,
            CancellationToken cancellationToken)
    {
        var usuarioId = httpContext.User.GetUserId();

        await service.MarcarTodasComoLeidasAsync(
            usuarioId,
            cancellationToken);

        return Results.NoContent();
    }
}