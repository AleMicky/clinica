using Clinica.Modules.Compras.Application.Abstractions;
using Clinica.Modules.Compras.Infrastructure.Persistence;
using Clinica.Modules.Compras.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Compras.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddComprasInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ComprasDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IProveedorService, ProveedorService>();
        services.AddScoped<IOrdenCompraService, OrdenCompraService>();
        return services;
    }
}
