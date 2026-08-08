using Clinica.Api.Modules.Servicios.CategoriaServicio.Endpoints;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Services;
using Clinica.Api.Modules.Servicios.Convenios.Endpoints;
using Clinica.Api.Modules.Servicios.Convenios.Services;
using Clinica.Api.Modules.Servicios.Servicios.Endpoints;
using Clinica.Api.Modules.Servicios.Servicios.Services;

namespace Clinica.Api.Modules.Servicios;

public static class ServiciosModule
{
    public static IServiceCollection AddServiciosModule(
        this IServiceCollection services)
    {
        services.AddScoped<CategoriaServicioService>();
        services.AddScoped<ConvenioService>();
        services.AddScoped<ServicioService>();

        return services;
    }

    public static IEndpointRouteBuilder MapServiciosModule(
        this IEndpointRouteBuilder app)
    {
        app.MapCategoriaServicioEndpoints();
        app.MapConvenioEndpoints();
        app.MapServicioEndpoints();

        return app;
    }
}
