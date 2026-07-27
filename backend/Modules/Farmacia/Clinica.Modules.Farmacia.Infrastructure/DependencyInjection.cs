using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Infrastructure.Persistence;
using Clinica.Modules.Farmacia.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Farmacia.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddFarmaciaInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<FarmaciaDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IPrecioService, PrecioService>();
        services.AddScoped<IRecetaService, RecetaService>();
        services.AddScoped<IDispensacionService, DispensacionService>();
        return services;
    }
}
