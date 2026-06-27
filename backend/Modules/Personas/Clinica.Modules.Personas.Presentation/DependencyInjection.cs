using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Personas.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPersonasPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapPersonasModule(this IEndpointRouteBuilder app)
    {
        return app.MapPersonasEndpoints();
    }
}
