using Clinica.Api.Modules.Parametros.Catalogo.Endpoints;
using Clinica.Api.Modules.Parametros.Catalogo.Services;
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

        return services;
    }

    public static IEndpointRouteBuilder MapParametrosModule(this IEndpointRouteBuilder app)
    {
        app.MapCatalogoEndpoints();
        app.MapUnidadesMedidaEndpoints();
        app.MapMonedaEndpoints();
        app.MapTipoCambioEndpoints();

        return app;
    }
}