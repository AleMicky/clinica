using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.AtencionMedica.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddAtencionMedicaPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapAtencionMedicaModule(this IEndpointRouteBuilder app)
    {
        return app.MapAtencionMedicaEndpoints();
    }
}
