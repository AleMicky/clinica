using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Farmacia.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddFarmaciaPresentation(this IServiceCollection services) => services;

    public static IEndpointRouteBuilder MapFarmaciaModule(this IEndpointRouteBuilder app) =>
        app.MapFarmaciaEndpoints();
}
