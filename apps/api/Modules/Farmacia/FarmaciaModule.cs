using Clinica.Api.Modules.Farmacia.Dispensacion.Endpoints;
using Clinica.Api.Modules.Farmacia.Dispensacion.Services;

namespace Clinica.Api.Modules.Farmacia;

public static class FarmaciaModule
{
    public static IServiceCollection AddFarmaciaModule(this IServiceCollection services)
    {
        services.AddScoped<IDispensacionService, DispensacionService>();
        return services;
    }

    public static IEndpointRouteBuilder MapFarmaciaModule(this IEndpointRouteBuilder app)
    {
        app.MapDispensacionEndpoints();
        return app;
    }
}
