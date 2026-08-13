using Clinica.Api.Modules.Parametros.Catalogo.Endpoints;
using Clinica.Api.Modules.Parametros.Catalogo.Services;
using Clinica.Api.Modules.Parametros.Correlativo.Endpoints;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Parametros.MetodoPago.Endpoints;
using Clinica.Api.Modules.Parametros.MetodoPago.Services;
using Clinica.Api.Modules.Parametros.Moneda.Endpoints;
using Clinica.Api.Modules.Parametros.Moneda.Services;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Endpoints;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Services;

namespace Clinica.Api.Modules.Parametros.Catalogo;

public static class ParametrosModule
{
    public static IServiceCollection AddParametrosModule(
        this IServiceCollection services)
    {
        services.AddScoped<CatalogoGrupoService>();
        services.AddScoped<CatalogoItemService>();
        services.AddScoped<UnidadesMedidaService>();
        services.AddScoped<MonedaService>();
        services.AddScoped<TipoCambioService>();
        services.AddScoped<MetodoPagoService>();
        services.AddScoped<CorrelativoService>();

        return services;
    }

    public static IEndpointRouteBuilder MapParametrosModule(this IEndpointRouteBuilder app)
    {
        app.MapCatalogoEndpoints();
        app.MapUnidadesMedidaEndpoints();
        app.MapMonedaEndpoints();
        app.MapTipoCambioEndpoints();
        app.MapMetodoPagoEndpoints();
        app.MapCorrelativoEndpoints();

        return app;
    }
}