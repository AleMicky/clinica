using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Laboratorio.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddLaboratorioPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static IEndpointRouteBuilder MapLaboratorioModule(this IEndpointRouteBuilder app)
    {
        return app.MapLaboratorioEndpoints();
    }
}
