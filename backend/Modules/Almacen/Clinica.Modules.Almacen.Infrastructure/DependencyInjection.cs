using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.Modules.Almacen.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Almacen.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAlmacenInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AlmacenDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICategoriaService, CategoriaService>();
        services.AddScoped<IProductoService, ProductoService>();
        services.AddScoped<IExistenciaService, ExistenciaService>();
        services.AddScoped<ILoteConsultaService, LoteConsultaService>();
        services.AddScoped<IAlmacenStockService, AlmacenStockService>();

        return services;
    }
}
