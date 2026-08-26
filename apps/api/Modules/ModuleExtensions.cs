using Clinica.Api.Modules.Cajas;
using Clinica.Api.Modules.Notificaciones;
using Clinica.Api.Modules.Parametros.Catalogo;
using Clinica.Api.Modules.Recepcion;
using Clinica.Api.Modules.RecursosHumanos;
using Clinica.Api.Modules.Seguridad;
using Clinica.Api.Modules.Servicios;
using Clinica.Api.Modules.Ventas;
using Clinica.Api.Shared.Constants;

namespace Clinica.Api.Modules;


public static class ModuleExtensions
{
    public static IServiceCollection AddModules(
        this IServiceCollection services)
    {
        services.AddSeguridadModule();
        services.AddParametrosModule();
        services.AddRecursosHumanosModule();
        services.AddRecepcionModule();
        services.AddServiciosModule();
        services.AddVentasModule();
        services.AddCajasModule();
        services.AddNotificacionesModule();

        return services;
    }

    public static WebApplication MapModules(
        this WebApplication app)
    {
        var api = app.MapGroup(ApiRoutes.Prefix);

        api.MapSeguridadModule();
        api.MapParametrosModule();
        api.MapRecursosHumanosModule();
        api.MapRecepcionModule();
        api.MapServiciosModule();
        api.MapVentasModule();
        api.MapCajasModule();
        app.MapNotificacionesModule();

        return app;
    }
}