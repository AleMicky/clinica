using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Parametros.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddParametrosInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ParametrosDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICatalogoGrupoService, CatalogoGrupoService>();
        services.AddScoped<ICatalogoItemService, CatalogoItemService>();

        return services;
    }
}
