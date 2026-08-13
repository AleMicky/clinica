using Clinica.Api.Modules.Cajas.Caja.Endpoints;
using Clinica.Api.Modules.Cajas.Caja.Services;
using Clinica.Api.Modules.Cajas.TurnoCaja.Endpoints;
using Clinica.Api.Modules.Cajas.TurnoCaja.Services;

namespace Clinica.Api.Modules.Cajas;

public static class CajasModule
{
    public static IServiceCollection AddCajasModule(
        this IServiceCollection services)
    {
        services.AddScoped<CajaService>();
        services.AddScoped<TurnoCajaService>();

        return services;
    }

    public static IEndpointRouteBuilder MapCajasModule(
        this IEndpointRouteBuilder app)
    {
        app.MapCajaEndpoints();
        app.MapTurnoCajaEndpoints();

        return app;
    }
}
