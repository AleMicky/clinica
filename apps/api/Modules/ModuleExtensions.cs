using Clinica.Api.Modules.Parametros.Catalogo;
using Clinica.Api.Modules.Recepcion;
using Clinica.Api.Modules.RecursosHumanos;
using Clinica.Api.Modules.Seguridad;
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
        return app;
    }
}