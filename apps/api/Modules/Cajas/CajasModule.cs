using Clinica.Api.Modules.Cajas.ArqueoCaja.Endpoints;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Services;
using Clinica.Api.Modules.Cajas.Caja.Endpoints;
using Clinica.Api.Modules.Cajas.Caja.Services;
using Clinica.Api.Modules.Cajas.Cobro.Endpoints;
using Clinica.Api.Modules.Cajas.Cobro.Services;
using Clinica.Api.Modules.Cajas.DevolucionCobro.Endpoints;
using Clinica.Api.Modules.Cajas.DevolucionCobro.Services;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Endpoints;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Services;
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
        services.AddScoped<MovimientoCajaService>();
        services.AddScoped<CobroService>();
        services.AddScoped<CobroDetalleService>();
        services.AddScoped<DevolucionCobroService>();
        services.AddScoped<ArqueoCajaService>();

        return services;
    }

    public static IEndpointRouteBuilder MapCajasModule(
        this IEndpointRouteBuilder app)
    {
        app.MapCajaEndpoints();
        app.MapTurnoCajaEndpoints();
        app.MapMovimientoCajaEndpoints();
        app.MapCobroEndpoints();
        app.MapDevolucionCobroEndpoints();
        app.MapArqueoCajaEndpoints();

        return app;
    }
}