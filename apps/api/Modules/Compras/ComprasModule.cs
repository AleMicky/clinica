using Clinica.Api.Modules.Compras.CotizacionCompra.Endpoints;
using Clinica.Api.Modules.Compras.CotizacionCompra.Services;
using Clinica.Api.Modules.Compras.OrdenCompra.Endpoints;
using Clinica.Api.Modules.Compras.OrdenCompra.Services;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Endpoints;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Services;
using Clinica.Api.Modules.Compras.Proveedor.Endpoints;
using Clinica.Api.Modules.Compras.Proveedor.Services;
using Clinica.Api.Modules.Compras.RecepcionCompra.Endpoints;
using Clinica.Api.Modules.Compras.RecepcionCompra.Services;
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
        services.AddScoped<ICotizacionCompraService, CotizacionCompraService>();
        services.AddScoped<IOrdenCompraService, OrdenCompraService>();
        services.AddScoped<IRecepcionCompraService, RecepcionCompraService>();
        services.AddScoped<IDevolucionProveedorService, DevolucionProveedorService>();

        return services;
    }

    public static IEndpointRouteBuilder MapComprasModule(
        this IEndpointRouteBuilder app)
    {
        app.MapProveedorEndpoints();
        app.MapSolicitudCompraEndpoints();
        app.MapCotizacionCompraEndpoints();
        app.MapOrdenCompraEndpoints();
        app.MapRecepcionCompraEndpoints();
        app.MapDevolucionProveedorEndpoints();

        return app;
    }
}
