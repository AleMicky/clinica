using Clinica.Modules.Seguridad.Application;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Seguridad.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddSeguridadPresentation(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(SeguridadEndpoints.AdminPolicy, policy =>
                policy.RequireRole(SeguridadRoles.Administrador));

        return services;
    }

    public static IEndpointRouteBuilder MapSeguridadModule(this IEndpointRouteBuilder app)
    {
        return app.MapSeguridadEndpoints();
    }
}