using Clinica.Api.Modules.Almacenes.Almacen.Endpoints;
using Clinica.Api.Modules.Almacenes.Almacen.Services;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Endpoints;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Services;
using Clinica.Api.Modules.Almacenes.Lote.Endpoints;
using Clinica.Api.Modules.Almacenes.Lote.Services;
using Clinica.Api.Modules.Almacenes.Producto.Endpoints;
using Clinica.Api.Modules.Almacenes.Producto.Services;

namespace Clinica.Api.Modules.Almacenes;

public static class AlmacenesModule
{
    public static IServiceCollection AddAlmacenesModule(
        this IServiceCollection services)
    {
        services.AddScoped<AlmacenService>();
        services.AddScoped<ICategoriaProductoService, CategoriaProductoService>();
        services.AddScoped<IProductoService, ProductoService>();
        services.AddScoped<ILoteService, LoteService>();

        return services;
    }

    public static IEndpointRouteBuilder MapAlmacenesModule(
        this IEndpointRouteBuilder app)
    {
        app.MapAlmacenEndpoints();
        app.MapCategoriaProductoEndpoints();
        app.MapProductoEndpoints();
        app.MapLoteEndpoints();

        return app;
    }
}
