using Clinica.Api.Modules.Notificaciones.Endpoints;
using Clinica.Api.Modules.Notificaciones.Hubs;
using Clinica.Api.Modules.Notificaciones.Services;
using Microsoft.AspNetCore.SignalR;

namespace Clinica.Api.Modules.Notificaciones;

public static class NotificacionesModule
{
    public static IServiceCollection AddNotificacionesModule(
        this IServiceCollection services)
    {
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
        services.AddScoped<INotificacionService, NotificacionService>();

        return services;
    }

    public static IEndpointRouteBuilder MapNotificacionesModule(this IEndpointRouteBuilder app)
    {
        app.MapNotificacionEndpoints();

        return app;
    }
}