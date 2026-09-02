using Clinica.Api.Modules.Compras.Proveedor.Endpoints;
using Clinica.Api.Modules.Compras.Proveedor.Services;
using Clinica.Api.Modules.Compras.SolicitudCompra.Endpoints;
using Clinica.Api.Modules.Compras.SolicitudCompra.Services;

namespace Clinica.Api.Modules.Compras;

public static class ComprasModule
{
    public static IServiceCollection AddComprasModule(
        this IServiceCollection services)
    {
        services.AddScoped<IProveedorService, ProveedorService>();
        services.AddScoped<ISolicitudCompraService, SolicitudCompraService>();

        return services;
    }

    public static IEndpointRouteBuilder MapComprasModule(
        this IEndpointRouteBuilder app)
    {
        app.MapProveedorEndpoints();
        app.MapSolicitudCompraEndpoints();

        return app;
    }
}
