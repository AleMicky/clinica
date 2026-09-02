using Clinica.Api.Modules.Almacenes;
using Clinica.Api.Modules.Cajas;
using Clinica.Api.Modules.Compras;
using Clinica.Api.Modules.Notificaciones;
using Clinica.Api.Modules.Parametros;
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
        services.AddAlmacenesModule();
        services.AddSeguridadModule();
        services.AddParametrosModule();
        services.AddRecursosHumanosModule();
        services.AddRecepcionModule();
        services.AddServiciosModule();
        services.AddVentasModule();
        services.AddCajasModule();
        services.AddNotificacionesModule();
        services.AddComprasModule();

        return services;
    }

    public static WebApplication MapModules(
        this WebApplication app)
    {
        var api = app.MapGroup(ApiRoutes.Prefix);

        api.MapAlmacenesModule();
        api.MapSeguridadModule();
        api.MapParametrosModule();
        api.MapRecursosHumanosModule();
        api.MapRecepcionModule();
        api.MapServiciosModule();
        api.MapVentasModule();
        api.MapCajasModule();
        api.MapNotificacionesModule();
        api.MapComprasModule();

        return app;
    }
}