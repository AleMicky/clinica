using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Compras.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddComprasPresentation(this IServiceCollection services) => services;

    public static IEndpointRouteBuilder MapComprasModule(this IEndpointRouteBuilder app) =>
        app.MapComprasEndpoints();
}
