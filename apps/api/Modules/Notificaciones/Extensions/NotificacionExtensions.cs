using Clinica.Api.Modules.Notificaciones.Hubs;
using Clinica.Api.Modules.Notificaciones.Services;
using Microsoft.AspNetCore.SignalR;

namespace Clinica.Api.Modules.Notificaciones.Extensions;

public static class NotificacionExtensions
{
    public static IServiceCollection AddNotificaciones(this IServiceCollection services)
    {
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
        services.AddScoped<INotificacionService, NotificacionService>();

        return services;
    }
}