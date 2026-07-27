using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Almacen.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddAlmacenPresentation(this IServiceCollection services) =>
        services;

    public static IEndpointRouteBuilder MapAlmacenModule(this IEndpointRouteBuilder app) =>
        app.MapAlmacenEndpoints();
}
