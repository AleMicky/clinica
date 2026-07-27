using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Caja.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Caja.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCajaInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<CajaDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICajaCargoService, CajaCargoService>();
        services.AddScoped<ICajaCuentaService, CajaCuentaService>();
        services.AddScoped<ICajaPagoService, CajaPagoService>();
        services.AddScoped<ICajaFisicaService, CajaFisicaService>();
        services.AddScoped<ITurnoCajaService, TurnoCajaService>();
        services.AddScoped<IMovimientoCajaService, MovimientoCajaService>();
        services.AddScoped<IArqueoCajaService, ArqueoCajaService>();
        services.AddScoped<IMetodoPagoCatalogService, MetodoPagoCatalogService>();
        services.AddScoped<IConceptoCajaCatalogService, ConceptoCajaCatalogService>();

        return services;
    }
}
