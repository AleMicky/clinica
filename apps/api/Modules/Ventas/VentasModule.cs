using Clinica.Api.Modules.Ventas.Venta.Endpoints;
using Clinica.Api.Modules.Ventas.Venta.Services;

namespace Clinica.Api.Modules.Ventas;

public static class VentasModule
{
    public static IServiceCollection AddVentasModule(
        this IServiceCollection services)
    {
        services.AddScoped<VentaService>();
        services.AddScoped<VentaDetalleService>();
        services.AddScoped<VentaPagadorService>();

        return services;
    }

    public static IEndpointRouteBuilder MapVentasModule(
        this IEndpointRouteBuilder app)
    {
        app.MapVentaEndpoints();

        return app;
    }
}
