using Clinica.Api.Modules.Quirofano.Cirugia.Endpoints;
using Clinica.Api.Modules.Quirofano.Cirugia.Services;

namespace Clinica.Api.Modules.Quirofano;

public static class QuirofanoModule
{
    public static IServiceCollection AddQuirofanoModule(this IServiceCollection services)
    {
        services.AddScoped<ICirugiaService, CirugiaService>();
        return services;
    }

    public static IEndpointRouteBuilder MapQuirofanoModule(this IEndpointRouteBuilder app)
    {
        app.MapCirugiaEndpoints();
        return app;
    }
}
