using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.RecursosHumanos.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddRecursosHumanosPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapRecursosHumanosModule(this IEndpointRouteBuilder app)
    {
        return app.MapRecursosHumanosEndpoints();
    }
}
