using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Parametros.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddParametrosPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapParametrosModule(this IEndpointRouteBuilder app)
    {
        return app.MapParametrosEndpoints();
    }
}
