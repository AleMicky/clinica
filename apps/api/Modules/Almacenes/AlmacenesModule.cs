using Clinica.Api.Modules.Almacenes.AjusteInventario.Endpoints;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Services;
using Clinica.Api.Modules.Almacenes.Almacen.Endpoints;
using Clinica.Api.Modules.Almacenes.Almacen.Services;
using Clinica.Api.Modules.Almacenes.BajaInventario.Endpoints;
using Clinica.Api.Modules.Almacenes.BajaInventario.Services;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Endpoints;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Services;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Endpoints;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Services;
using Clinica.Api.Modules.Almacenes.Existencia.Endpoints;
using Clinica.Api.Modules.Almacenes.Existencia.Services;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Endpoints;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Services;
using Clinica.Api.Modules.Almacenes.Lote.Endpoints;
using Clinica.Api.Modules.Almacenes.Lote.Services;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Endpoints;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Modules.Almacenes.Producto.Endpoints;
using Clinica.Api.Modules.Almacenes.Producto.Services;
using Clinica.Api.Modules.Almacenes.ReservaStock.Endpoints;
using Clinica.Api.Modules.Almacenes.ReservaStock.Services;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Endpoints;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Services;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Endpoints;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Services;

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
        services.AddScoped<IExistenciaService, ExistenciaService>();
        services.AddScoped<ITipoMovimientoInventarioService, TipoMovimientoInventarioService>();
        services.AddScoped<IMovimientoInventarioService, MovimientoInventarioService>();
        services.AddScoped<ITransferenciaAlmacenService, TransferenciaAlmacenService>();
        services.AddScoped<IInventarioFisicoService, InventarioFisicoService>();
        services.AddScoped<IAjusteInventarioService, AjusteInventarioService>();
        services.AddScoped<IReservaStockService, ReservaStockService>();
        services.AddScoped<IConsumoInternoService, ConsumoInternoService>();
        services.AddScoped<IBajaInventarioService, BajaInventarioService>();

        return services;
    }

    public static IEndpointRouteBuilder MapAlmacenesModule(
        this IEndpointRouteBuilder app)
    {
        app.MapAlmacenEndpoints();
        app.MapCategoriaProductoEndpoints();
        app.MapProductoEndpoints();
        app.MapLoteEndpoints();
        app.MapExistenciaEndpoints();
        app.MapTipoMovimientoInventarioEndpoints();
        app.MapMovimientoInventarioEndpoints();
        app.MapTransferenciaAlmacenEndpoints();
        app.MapInventarioFisicoEndpoints();
        app.MapAjusteInventarioEndpoints();
        app.MapReservaStockEndpoints();
        app.MapConsumoInternoEndpoints();
        app.MapBajaInventarioEndpoints();

        return app;
    }
}
