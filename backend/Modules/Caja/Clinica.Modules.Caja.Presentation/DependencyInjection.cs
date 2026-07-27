using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Caja.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddCajaPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapCajaModule(this IEndpointRouteBuilder app)
    {
        return app.MapCajaEndpoints();
    }
}
